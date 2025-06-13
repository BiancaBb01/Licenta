// MessagesPage.js - Cu debugging îmbunătățit

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import '../css/MessagePage.css';

const MessagesPage = () => {
  const { user } = useAuth();
  
  const {
    isConnected,
    conversations,
    messages,
    notifications,
    unreadNotifications,
    typingUsers,
    loadingConversations,
    loadingMessages,
    useRestFallback,
    
    // Methods
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    loadConversations,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    
    // Debug methods
    forceLoadConversations,
    debugConnection,
    forceRestAPI
  } = useSocketContext();

  // Local state
  const [activeConversation, setActiveConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('conversations');
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const currentConversationRef = useRef(null);

  console.log('📄 MessagesPage render - user:', !!user, 'connected:', isConnected, 'fallback:', useRestFallback, 'conversations:', conversations.length, 'messages:', messages.length);

  // Auto scroll to latest message - OPTIMIZED
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [messages.length]); // Only trigger when message count changes

  // Handle conversation selection - OPTIMIZED
  const handleSelectConversation = (conversation) => {
    console.log('👆 Selecting conversation:', conversation.id);
    
    // Don't reload if same conversation
    if (currentConversationRef.current === conversation.id) {
      console.log('⏭️ Same conversation already selected, skipping...');
      return;
    }
    
    // Leave previous conversation
    if (currentConversationRef.current) {
      leaveConversation(currentConversationRef.current);
    }
    
    // Set new conversation
    setActiveConversation(conversation);
    currentConversationRef.current = conversation.id;
    setActiveTab('conversations');
    setError(null);
    
    // Join new conversation and load messages
    joinConversation(conversation.id);
  };

  // Handle sending message - OPTIMIZED
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    const messageContent = newMessage.trim();
    if (!messageContent || !activeConversation) {
      console.log('❌ Cannot send message:', { 
        hasMessage: !!messageContent, 
        hasConversation: !!activeConversation, 
        isConnected 
      });
      return;
    }
    
    try {
      console.log('📤 Sending message:', messageContent);
      
      // Clear input immediately for better UX
      setNewMessage('');
      
      // Stop typing indicator
      stopTyping(activeConversation.id);
      
      // Send message
      await sendMessage(activeConversation.id, messageContent);
      
    } catch (err) {
      console.error('❌ Error sending message:', err);
      setError('Eroare la trimiterea mesajului');
      // Restore message in input if failed
      setNewMessage(messageContent);
    }
  };

  // Handle typing indicator - DEBOUNCED
  const typingTimeoutRef = useRef(null);
  const handleTyping = (e) => {
    const value = e.target.value;
    setNewMessage(value);
    
    if (!activeConversation || !isConnected) return;
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (value.length > 0) {
      startTyping(activeConversation.id);
      
      // Auto-stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(activeConversation.id);
      }, 3000);
    } else {
      stopTyping(activeConversation.id);
    }
  };

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Handle notification click
  const handleNotificationClick = (notification) => {
    console.log('🔔 Notification clicked:', notification);
    
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
    }

    if (notification.type === 'new_message' && notification.data?.conversationId) {
      const conversation = conversations.find(c => c.id === notification.data.conversationId);
      if (conversation) {
        handleSelectConversation(conversation);
      } else {
        console.log('🔄 Conversation not found, reloading...');
        loadConversations();
      }
    }
  };

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      console.error('Error formatting date:', err);
      return '';
    }
  };

  const isOwnMessage = (senderId) => {
    return senderId === user?.id;
  };

  const getOtherPersonName = (conversation) => {
    if (!conversation) return '';
    
    if (conversation.otherUser) {
      return conversation.otherUser.name || 'Utilizator';
    }
    
    const otherUser = user?.id === conversation.buyerId 
      ? conversation.seller 
      : conversation.buyer;
    
    return otherUser?.name || 'Utilizator';
  };

  const getProductName = (conversation) => {
    if (!conversation) return '';
    
    if (conversation.product) {
      return conversation.product.name;
    }
    
    if (conversation.Product) {
      return conversation.Product.name;
    }
    
    return 'Produs';
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_message': return '💬';
      case 'conversation_started': return '🆕';
      case 'new_order': return '🛒';
      case 'order_status_update': return '📦';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  const getNotificationTitle = (notification) => {
    switch (notification.type) {
      case 'new_message':
        return `Mesaj nou de la ${notification.data?.senderName || 'utilizator'}`;
      case 'conversation_started':
        return 'Conversație nouă';
      case 'new_order':
        return `Comandă nouă de la ${notification.data?.buyerName || 'utilizator'}`;
      case 'order_status_update':
        return 'Status comandă actualizat';
      case 'system':
        return 'Notificare sistem';
      default:
        return 'Notificare';
    }
  };

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case 'new_message':
        return notification.data?.message?.content || 'Mesaj nou';
      case 'conversation_started':
        return `${notification.data?.buyerName || 'Un utilizator'} a început o conversație cu tine`;
      case 'new_order':
        return `Comandă de ${notification.data?.orderTotal || '0'} RON`;
      case 'order_status_update':
        return `Comanda ta este acum: ${notification.data?.newStatus || 'actualizată'}`;
      case 'system':
        return notification.data?.message || 'Notificare sistem';
      default:
        return 'Notificare nouă';
    }
  };

  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      if (diff < 24 * 60 * 60 * 1000) {
        return date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
      } else if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        return `${days} zi${days > 1 ? 'le' : ''}`;
      } else {
        return date.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' });
      }
    } catch (err) {
      console.error('Error formatting notification time:', err);
      return '';
    }
  };

  // Loading state
  if (!user) {
    return (
      <div className="messages-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Se încarcă utilizatorul...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <div className="messages-header">
        <h1>Mesajele mele</h1>
        
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="status-indicator"></span>
          {isConnected ? (
            <>
              <span>🟢 Conectat</span>
              <small>{useRestFallback ? 'REST API' : 'Socket.io'}</small>
            </>
          ) : (
            <>
              <span>🔴 Deconectat</span>
              <small>se conectează...</small>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'conversations' ? 'active' : ''}`}
          onClick={() => setActiveTab('conversations')}
        >
          <span className="tab-icon">💬</span>
          Conversații
          {isConnected && !useRestFallback && (
            <span className="connection-badge">LIVE</span>
          )}
          {useRestFallback && (
            <span className="connection-badge">REST</span>
          )}
        </button>
        <button 
          className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <span className="tab-icon">🔔</span>
          Notificări
          {unreadNotifications > 0 && (
            <span className="notification-badge">{unreadNotifications}</span>
          )}
        </button>
      </div>
      
      {loadingConversations ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Se încarcă conversațiile...</p>
        </div>
      ) : (
        <div className="message-container">
          {/* TAB CONVERSAȚII */}
          {activeTab === 'conversations' && (
            <>
              <div className="conversations-list">
                <div className="conversations-header">
                  <h2>Conversații</h2>
                  <div className="debug-buttons">
                    <button 
                      onClick={debugConnection}
                      className="debug-btn"
                      title="Debug connection info"
                      style={{ padding: '4px 8px', fontSize: '12px', margin: '2px' }}
                    >
                      🔍
                    </button>
                    <button 
                      onClick={forceLoadConversations}
                      className="debug-btn"
                      title="Force load conversations"
                      style={{ padding: '4px 8px', fontSize: '12px', margin: '2px' }}
                    >
                      ⚡
                    </button>
                    <button 
                      onClick={forceRestAPI}
                      className="debug-btn"
                      title="Force REST API mode"
                      style={{ padding: '4px 8px', fontSize: '12px', margin: '2px', background: '#ff6b35', color: 'white' }}
                    >
                      🔧 REST
                    </button>
                    <button 
                      onClick={loadConversations}
                      className="refresh-btn"
                      disabled={loadingConversations}
                      style={{ padding: '4px 8px', fontSize: '12px', margin: '2px' }}
                    >
                      🔄
                    </button>
                  </div>
                </div>
                
                <div style={{ padding: '10px', fontSize: '12px', background: '#f0f0f0', borderBottom: '1px solid #ddd' }}>
                  <strong>DEBUG INFO:</strong><br/>
                  Connected: {isConnected ? '✅' : '❌'} | 
                  Fallback: {useRestFallback ? '✅' : '❌'} | 
                  Conversations: {conversations.length} | 
                  Messages: {messages.length}
                </div>
                
                {conversations.length === 0 ? (
                  <div className="no-conversations">
                    <div className="no-conversations-icon">💬</div>
                    <h3>Nicio conversație</h3>
                    <p>Contactați vânzătorii pentru a începe o conversație.</p>
                    <button 
                      onClick={forceLoadConversations}
                      style={{ marginTop: '10px', padding: '8px 16px' }}
                    >
                      🔄 Încearcă din nou
                    </button>
                  </div>
                ) : (
                  conversations.map(conv => (
                    <div 
                      key={conv.id} 
                      className={`conversation-item ${activeConversation?.id === conv.id ? 'active' : ''}`}
                      onClick={() => handleSelectConversation(conv)}
                    >
                      <div className="conversation-header">
                        <div className="conversation-name">{getOtherPersonName(conv)}</div>
                        {conv.otherUser?.status === 'online' && (
                          <span className="online-indicator">🟢</span>
                        )}
                      </div>
                      <div className="conversation-product">{getProductName(conv)}</div>
                      {conv.lastMessage?.content && (
                        <div className="conversation-preview">
                          {conv.lastMessage.content}
                        </div>
                      )}
                      {conv.unreadCount > 0 && (
                        <div className="unread-badge">{conv.unreadCount}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div className="chat-area">
                {activeConversation ? (
                  <>
                    <div className="chat-header">
                      <div className="chat-person-info">
                        <div className="chat-person">{getOtherPersonName(activeConversation)}</div>
                        {getProductName(activeConversation) && (
                          <div className="chat-product">
                            Discuție despre: {getProductName(activeConversation)}
                          </div>
                        )}
                      </div>
                      <div className="chat-status">
                        {isConnected && (
                          <div className="online-status">
                            🟢 <span>{useRestFallback ? 'REST' : 'Live'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="chat-messages">
                      {loadingMessages ? (
                        <div className="loading-messages">
                          <div className="loading-spinner"></div>
                          <p>Se încarcă mesajele...</p>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="no-messages">
                          <div className="no-messages-icon">💬</div>
                          <h3>Niciun mesaj încă</h3>
                          <p>Începeți conversația acum!</p>
                        </div>
                      ) : (
                        <>
                          {messages.map(msg => (
                            <div 
                              key={`${msg.id}-${msg.createdAt}`} 
                              className={`message ${isOwnMessage(msg.senderId) ? 'sent' : 'received'}`}
                            >
                              <div className="message-content">{msg.content}</div>
                              <div className="message-info">
                                <span className="message-time">{formatDate(msg.createdAt)}</span>
                                {msg.isRead && isOwnMessage(msg.senderId) && (
                                  <span className="read-indicator">✓✓</span>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          {typingUsers.length > 0 && (
                            <div className="typing-indicator">
                              <div className="typing-animation">
                                <span></span>
                                <span></span>
                                <span></span>
                              </div>
                              <div className="typing-text">
                                {typingUsers[0]} scrie...
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                    
                    <form className="message-input" onSubmit={handleSendMessage}>
                      <div className="input-container">
                        <textarea 
                          value={newMessage} 
                          onChange={handleTyping}
                          placeholder={isConnected ? `Scrie un mesaj... (${useRestFallback ? 'REST' : 'Live'})` : "Se conectează..."}
                          disabled={loadingMessages}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(e);
                            }
                          }}
                        />
                        <button 
                          type="submit" 
                          disabled={!newMessage.trim() || loadingMessages}
                          className="send-button"
                        >
                          📤
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="no-conversation">
                    <div className="no-conversation-content">
                      <div className="no-conversation-icon">💬</div>
                      <h3>Selectați o conversație</h3>
                      <p>Alegeți o conversație din lista din stânga pentru a vedea mesajele.</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB NOTIFICĂRI */}
          {activeTab === 'notifications' && (
            <div className="notifications-container">
              <div className="notifications-header">
                <h2>Notificări</h2>
                <div className="notifications-actions">
                  {notifications.length > 0 && (
                    <>
                      {unreadNotifications > 0 && (
                        <button 
                          className="mark-all-read-btn"
                          onClick={markAllNotificationsAsRead}
                        >
                          ✅ Marchează toate ca citite
                        </button>
                      )}
                      <button 
                        className="clear-all-btn"
                        onClick={clearAllNotifications}
                        title="Șterge toate notificările"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <div className="no-notifications">
                    <div className="no-notifications-icon">🔔</div>
                    <h3>Nicio notificare</h3>
                    <p>Notificările pentru mesaje, comenzi și conversații vor apărea aici.</p>
                    {isConnected && !useRestFallback && (
                      <div className="real-time-badge">
                        🟢 Primești notificări în timp real
                      </div>
                    )}
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div 
                      key={notification.id}
                      className={`notification-item ${!notification.isRead ? 'unread' : 'read'}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="notification-icon">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="notification-content">
                        <div className="notification-title">
                          {getNotificationTitle(notification)}
                        </div>
                        <div className="notification-message">
                          {getNotificationMessage(notification)}
                        </div>
                        <div className="notification-time">
                          {formatNotificationTime(notification.createdAt)}
                        </div>
                      </div>
                      
                      <div className="notification-actions">
                        {!notification.isRead && (
                          <div className="unread-indicator" title="Notificare necitită"></div>
                        )}
                        <button 
                          className="delete-notification-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          title="Șterge notificarea"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessagesPage;