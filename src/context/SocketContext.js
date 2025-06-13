// SocketContext.js - FIXED pentru evenimente custom din server

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import io from 'socket.io-client';
import axios from 'axios';

const SocketContext = createContext();

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Prevent multiple initializations
  const initialized = useRef(false);
  const mountedRef = useRef(true);
  const connectionConfirmedRef = useRef(false);
  const conversationsLoaded = useRef(false);
  
  // Socket states
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [useRestFallback, setUseRestFallback] = useState(false);
  const [token, setToken] = useState(null);
  
  // Data states
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  
  // Loading states
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  // Track active conversation to prevent message loading issues
  const activeConversationRef = useRef(null);
  
  // Computed states
  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  console.log('🔄 SocketContext render - user:', !!user, 'token:', !!token, 'connected:', isConnected, 'fallback:', useRestFallback);

  // Debug state changes
  useEffect(() => {
    console.log('📊 STATE CHANGE: isConnected =', isConnected);
  }, [isConnected]);
  
  useEffect(() => {
    console.log('📊 STATE CHANGE: useRestFallback =', useRestFallback);
  }, [useRestFallback]);

  // Initialize ONCE when component mounts
  useEffect(() => {
    if (initialized.current) return;
    
    console.log('🚀 SocketContext initializing...');
    initialized.current = true;
    mountedRef.current = true; // ✅ Asigură-te că este setat
    
    // Detect token ONCE
    const possibleKeys = ['token', 'authToken', 'accessToken', 'access_token', 'jwt', 'jwtToken'];
    let foundToken = null;
    
    for (const key of possibleKeys) {
      foundToken = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (foundToken) {
        console.log('🔑 Token found in:', key);
        break;
      }
    }
    
    setToken(foundToken);
    
    // Cleanup on unmount - doar pentru initialization
    return () => {
      console.log('🧹 SocketContext initialization cleanup');
      initialized.current = false;
      // NU setez mountedRef.current = false aici pentru că poate interfere cu socket connection
    };
  }, []); // Empty dependencies - run only once

  // API helper
  const apiCall = useCallback(async (method, endpoint, data = null) => {
    if (!token) throw new Error('No authentication token');
    
    const config = {
      method,
      url: `${process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'}/api${endpoint}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) config.data = data;
    
    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`❌ API call failed [${method} ${endpoint}]:`, error.response?.data || error.message);
      throw error;
    }
  }, [token]);

  // Socket connection - ONLY when we have user AND token
  useEffect(() => {
    if (!user?.id || !token || socket) return; // Prevent multiple connections
    
    console.log('🔌 Attempting Socket.io connection...');
    
    // ✅ IMPORTANT: Set mounted flag to true for this effect
    mountedRef.current = true;
    console.log('✅ Setting mountedRef.current = true for socket connection');
    
    const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
    let connectionTimeout;
    
    const newSocket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      forceNew: true,
      autoConnect: true,
      reconnection: false, // Disable auto-reconnection to prevent loops
      auth: {
        token: token,
        userId: user.id,
        userName: user.name
      }
    });

    // ✅ FIX: Standard Socket.io connect event
    newSocket.on('connect', () => {
      if (!mountedRef.current) return;
      console.log('🔌 Socket.io transport connected');
      // Nu setăm încă isConnected=true, așteptăm confirmarea custom 'connected'
    });

    // ✅ FIX: Handler pentru evenimentul custom 'connected' de la server
    newSocket.on('connected', (data) => {
      console.log('🎯 CONNECTED HANDLER CALLED!');
      console.log('  - mountedRef.current:', mountedRef.current);
      console.log('  - initialized.current:', initialized.current);
      console.log('  - data:', data);
      
      // ✅ TEMPORARY FIX: Nu verific mountedRef pentru handler-ul critical de conectare
      // if (!mountedRef.current) {
      //   console.log('❌ Component unmounted, skipping connected handler');
      //   console.log('❌ This should not happen - investigating...');
      //   return;
      // }
      
      console.log('✅ Server confirmed connection:', data);
      clearTimeout(connectionTimeout);
      connectionConfirmedRef.current = true; // ✅ IMPORTANT!
      
      // Asigură-te că componenta este marcată ca mounted
      mountedRef.current = true;
      
      console.log('🔧 Setting isConnected = true...');
      setIsConnected(true);
      
      console.log('🔧 Setting useRestFallback = false...');
      setUseRestFallback(false);
      
      console.log('🎉 Socket.io fully operational!');
    });

    // ✅ FIX: Handler pentru ping de la server
    newSocket.on('ping', (data) => {
      console.log('🏓 PING HANDLER CALLED!');
      console.log('  - mountedRef.current:', mountedRef.current);
      console.log('  - initialized.current:', initialized.current);
      console.log('  - data:', data);
      
      // ✅ TEMPORARY FIX: Nu verific mountedRef pentru ping
      // if (!mountedRef.current) {
      //   console.log('❌ Component unmounted, skipping ping handler');
      //   return;
      // }
      
      console.log('🏓 Received ping from server:', data.message);
      // Opțional: răspunde cu pong
      newSocket.emit('pong', { message: 'Client pong', timestamp: new Date() });
    });

    // Connection error - immediate fallback
    newSocket.on('connect_error', (error) => {
      if (!mountedRef.current) return;
      console.log('❌ Socket.io failed, switching to REST API:', error.message);
      clearTimeout(connectionTimeout);
      console.log('🔄 FORCING useRestFallback = true (connect_error)');
      setUseRestFallback(true);
      setIsConnected(false);
      connectionConfirmedRef.current = false;
      newSocket.disconnect();
    });

    newSocket.on('error', (error) => {
      console.log('🚨 Socket error:', error);
    });

    newSocket.on('disconnect', (reason) => {
      if (!mountedRef.current) return;
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);
      connectionConfirmedRef.current = false;
    });

    // Socket.io event handlers - FĂRĂ verificare mountedRef pentru handler-urile critice
    newSocket.on('conversationsList', (conversationsList) => {
      console.log('📋 Socket: Conversations loaded:', conversationsList.length);
      setConversations(conversationsList);
      setLoadingConversations(false);
    });

    newSocket.on('conversationJoined', (data) => {
      console.log('📬 Socket: Messages loaded for conversation:', data.conversationId, 'messages:', data.messages?.length);
      setMessages(data.messages || []);
      setLoadingMessages(false);
    });

    newSocket.on('newMessage', (message) => {
      console.log('📩 Socket: New message received:', message.content);
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('userTyping', (data) => {
      if (data.isTyping) {
        setTypingUsers(prev => prev.includes(data.userName) ? prev : [...prev, data.userName]);
      } else {
        setTypingUsers(prev => prev.filter(name => name !== data.userName));
      }
    });

    // ✅ DEBUG - Log toate event-urile primite
    newSocket.onAny((eventName, ...args) => {
      console.log(`📡 SOCKET EVENT: ${eventName}`, args);
    });

    console.log('📡 All event handlers set up successfully!');

    // ✅ ACUM SETEZ SOCKET-UL ÎN STATE - DUPĂ CE HANDLER-URILE SUNT SETATE
    console.log('🔧 Setting socket in state...');
    setSocket(newSocket);

    // ✅ TIMEOUT pentru fallback - AJUSTAT
    connectionTimeout = setTimeout(() => {
      if (!mountedRef.current) return;
      
      console.log('⏰ Checking connection status after timeout...');
      console.log('  - socket.connected:', newSocket.connected);
      console.log('  - connectionConfirmed:', connectionConfirmedRef.current);
      console.log('  - isConnected state:', isConnected);
      
      // ✅ Verifică dacă avem și transport connection și server confirmation
      if (newSocket.connected && connectionConfirmedRef.current) {
        console.log('🎉 Socket.io working properly, no fallback needed');
        return;
      }
      
      if (newSocket.connected && !connectionConfirmedRef.current) {
        console.log('⚠️ Socket connected but no server confirmation, switching to REST API');
      } else {
        console.log('⏰ Socket.io timeout, switching to REST API');
      }
      
      console.log('🔄 FORCING useRestFallback = true (timeout)');
      setUseRestFallback(true);
      setIsConnected(false);
      connectionConfirmedRef.current = false;
      newSocket.disconnect();
    }, 8000); // Măresc timeout-ul la 8 secunde

    // ✅ CONEXIUNEA SE FACE AUTOMAT (autoConnect: true)
    console.log('🚀 Socket.io connection initiated automatically...');

    // ✅ BACKUP: Verificare periodică în caz că handler-urile custom nu funcționează
    const statusCheckInterval = setInterval(() => {
      // Verificare simplificată - nu depend de mountedRef
      if (!newSocket.connected) {
        return; // Nu face nimic dacă socket-ul nu e conectat
      }
      
      // Dacă socket-ul este conectat dar starea nu s-a actualizat
      if (newSocket.connected && !isConnected && !connectionConfirmedRef.current) {
        console.log('🔄 BACKUP: Socket connected but state not updated, forcing update...');
        connectionConfirmedRef.current = true;
        mountedRef.current = true; // Asigură-te că este setat
        setIsConnected(true);
        setUseRestFallback(false);
        clearInterval(statusCheckInterval);
      }
      
      // Dacă avem confirmarea de conexiune dar state-ul nu s-a actualizat
      if (connectionConfirmedRef.current && !isConnected) {
        console.log('🔄 BACKUP: Connection confirmed but state not updated, forcing update...');
        mountedRef.current = true; // Asigură-te că este setat
        setIsConnected(true);
        setUseRestFallback(false);
        clearInterval(statusCheckInterval);
      }
    }, 1000);

    return () => {
      console.log('🧹 Socket connection cleanup started...');
      console.log('  - Clearing timeouts and intervals...');
      clearTimeout(connectionTimeout);
      clearInterval(statusCheckInterval);
      
      console.log('  - Resetting connection flags...');
      connectionConfirmedRef.current = false;
      conversationsLoaded.current = false;
      
      console.log('  - Disconnecting socket...');
      newSocket.removeAllListeners();
      newSocket.disconnect();
      
      console.log('  - Setting mountedRef to false...');
      mountedRef.current = false;
      
      console.log('🧹 Socket cleanup completed');
    };
  }, [user?.id, token]); // Only depend on user ID and token

  // REST API methods
  const loadConversationsRest = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      setLoadingConversations(true);
      console.log('📡 REST: Loading conversations...');
      
      const data = await apiCall('GET', '/messages/conversations');
      
      if (!mountedRef.current) return;
      console.log('📋 REST: Conversations loaded:', data.length || 0);
      setConversations(data || []);
    } catch (error) {
      if (!mountedRef.current) return;
      console.error('❌ REST: Error loading conversations:', error.message);
      setConversations([]);
    } finally {
      if (mountedRef.current) {
        setLoadingConversations(false);
      }
    }
  }, [apiCall]);

  const loadMessagesRest = useCallback(async (conversationId) => {
    if (!mountedRef.current) return;
    
    try {
      setLoadingMessages(true);
      console.log('📡 REST: Loading messages for conversation:', conversationId);
      
      const data = await apiCall('GET', `/messages/conversations/${conversationId}/messages`);
      
      if (!mountedRef.current) return;
      console.log('📬 REST: Messages loaded:', data.length || 0);
      setMessages(data || []);
    } catch (error) {
      if (!mountedRef.current) return;
      console.error('❌ REST: Error loading messages:', error.message);
      setMessages([]);
    } finally {
      if (mountedRef.current) {
        setLoadingMessages(false);
      }
    }
  }, [apiCall]);

  const sendMessageRest = useCallback(async (conversationId, content) => {
    try {
      console.log('📤 REST: Sending message:', content);
      
      const data = await apiCall('POST', `/messages/conversations/${conversationId}/messages`, {
        content: content
      });
      
      if (!mountedRef.current) return { success: false };
      
      console.log('✅ REST: Message sent successfully');
      if (data.message) {
        setMessages(prev => [...prev, data.message]);
      }
      
      return { success: true, message: data.message };
    } catch (error) {
      console.error('❌ REST: Error sending message:', error.message);
      throw error;
    }
  }, [apiCall]);

  // Public methods
  const loadConversations = useCallback(() => {
    if (loadingConversations) {
      console.log('⏳ Already loading conversations, skipping...');
      return;
    }
    
    if (useRestFallback || !socket || !isConnected) {
      console.log('📡 Loading conversations via REST API');
      loadConversationsRest();
    } else {
      console.log('📡 Socket: Requesting conversations...');
      setLoadingConversations(true);
      socket.emit('getConversations');
    }
  }, [useRestFallback, socket, isConnected, loadingConversations, loadConversationsRest]);

  const loadMessages = useCallback((conversationId) => {
    if (!conversationId) {
      console.log('❌ No conversation ID provided for loadMessages');
      return;
    }
    
    // Prevent loading same conversation multiple times
    if (activeConversationRef.current === conversationId && loadingMessages) {
      console.log('⏳ Already loading messages for this conversation, skipping...');
      return;
    }
    
    activeConversationRef.current = conversationId;
    
    if (useRestFallback || !socket || !isConnected) {
      loadMessagesRest(conversationId);
    } else {
      console.log('📡 Socket: Joining conversation and loading messages:', conversationId);
      setLoadingMessages(true);
      socket.emit('joinConversation', { conversationId });
    }
  }, [useRestFallback, socket, isConnected, loadingMessages, loadMessagesRest]);

  const joinConversation = useCallback((conversationId) => {
    console.log('🏠 Joining conversation:', conversationId);
    loadMessages(conversationId);
  }, [loadMessages]);

  const leaveConversation = useCallback((conversationId) => {
    console.log('🚪 Leaving conversation:', conversationId);
    activeConversationRef.current = null;
    setMessages([]); // Clear messages when leaving
    
    if (!useRestFallback && socket && isConnected) {
      socket.emit('leaveConversation', { conversationId });
    }
  }, [useRestFallback, socket, isConnected]);

  const sendMessage = useCallback((conversationId, content) => {
    if (!conversationId || !content?.trim()) {
      return Promise.reject(new Error('Invalid conversation ID or content'));
    }
    
    if (useRestFallback || !socket || !isConnected) {
      return sendMessageRest(conversationId, content);
    } else {
      console.log('📤 Socket: Sending message:', content);
      socket.emit('sendMessage', { conversationId, content });
      return Promise.resolve({ success: true });
    }
  }, [useRestFallback, socket, isConnected, sendMessageRest]);

  const startTyping = useCallback((conversationId) => {
    if (!useRestFallback && socket && isConnected) {
      socket.emit('typing', { conversationId, isTyping: true });
    }
  }, [useRestFallback, socket, isConnected]);

  const stopTyping = useCallback((conversationId) => {
    if (!useRestFallback && socket && isConnected) {
      socket.emit('typing', { conversationId, isTyping: false });
    }
  }, [useRestFallback, socket, isConnected]);

  const startProductConversation = useCallback((productId, sellerId) => {
    if (useRestFallback || !socket || !isConnected) {
      return apiCall('POST', '/messages/conversations', {
        productId,
        sellerId
      }).then(data => {
        loadConversations();
        return { success: true, conversationId: data.conversation?.id };
      });
    } else {
      socket.emit('startProductConversation', { productId, sellerId });
      return Promise.resolve({ success: true });
    }
  }, [useRestFallback, socket, isConnected, apiCall, loadConversations]);

  // Notification methods
  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const deleteNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // ✅ DEBUG METHOD - Force REST API
  const forceRestAPI = useCallback(() => {
    console.log('🔧 FORCING REST API mode...');
    setIsConnected(false);
    setUseRestFallback(true);
    if (socket) {
      socket.disconnect();
    }
    conversationsLoaded.current = false;
    loadConversations();
  }, [socket, loadConversations]);

  // ✅ DEBUG METHOD - Manual test
  const forceLoadConversations = useCallback(() => {
    console.log('🧪 MANUAL: Force loading conversations...');
    conversationsLoaded.current = false;
    loadConversations();
  }, [loadConversations]);

  // ✅ DEBUG METHOD - Test connection  
  const debugConnection = useCallback(() => {
    console.log('🔍 CONNECTION DEBUG:');
    console.log('  - socket:', !!socket);
    console.log('  - isConnected:', isConnected);
    console.log('  - useRestFallback:', useRestFallback);
    console.log('  - user:', !!user?.id, user?.name);
    console.log('  - token:', !!token);
    console.log('  - conversationsLoaded:', conversationsLoaded.current);
    console.log('  - conversations count:', conversations.length);
    console.log('  - connectionConfirmed:', connectionConfirmedRef.current);
    
    if (socket) {
      console.log('  - socket.connected:', socket.connected);
      console.log('  - socket.id:', socket.id);
    }
  }, [socket, isConnected, useRestFallback, user, token, conversations.length]);

  // Test REST API when Socket.io fails
  const testRestAPI = useCallback(async () => {
    if (!token) return false;
    
    try {
      console.log('🧪 Testing REST API connection...');
      const response = await apiCall('GET', '/health');
      console.log('✅ REST API test successful:', response);
      return true;
    } catch (error) {
      console.error('❌ REST API test failed:', error.message);
      return false;
    }
  }, [apiCall]);

  // Auto-test REST API when fallback is enabled
  useEffect(() => {
    if (useRestFallback && token && !isConnected) {
      testRestAPI();
    }
  }, [useRestFallback, token, isConnected, testRestAPI]);

  // Emergency fallback - dacă după 10 secunde nu s-a întâmplat nimic
  useEffect(() => {
    if (!user?.id || !token) return;
    
    const emergencyTimeout = setTimeout(() => {
      if (!isConnected && !useRestFallback && mountedRef.current) {
        console.log('🚨 EMERGENCY: No connection after 10 seconds, forcing REST fallback');
        setUseRestFallback(true);
      }
    }, 10000);
    
    return () => clearTimeout(emergencyTimeout);
  }, [user?.id, token, isConnected, useRestFallback]);

  // Auto-load conversations when connection is ready
  useEffect(() => {
    const shouldLoad = (isConnected || useRestFallback) && user?.id && token && !conversationsLoaded.current;
    
    if (shouldLoad) {
      console.log('📊 Loading initial conversations... (connected:', isConnected, 'fallback:', useRestFallback, ')');
      conversationsLoaded.current = true;
      loadConversations();
    }
  }, [isConnected, useRestFallback, user?.id, token, loadConversations]);

  // Stable context value
  const contextValue = React.useMemo(() => ({
    // Connection state
    socket,
    isConnected: isConnected || useRestFallback,
    useRestFallback,
    
    // Data
    conversations,
    messages,
    notifications,
    unreadNotifications,
    typingUsers: useRestFallback ? [] : typingUsers,
    
    // Loading states
    loadingConversations,
    loadingMessages,
    
    // Methods
    loadConversations,
    loadMessages,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    startProductConversation,
    
    // Notification methods
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    
    // Debug methods
    forceLoadConversations,
    debugConnection,
    forceRestAPI
  }), [
    socket,
    isConnected,
    useRestFallback,
    conversations,
    messages,
    notifications,
    unreadNotifications,
    typingUsers,
    loadingConversations,
    loadingMessages,
    loadConversations,
    loadMessages,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    startProductConversation,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    forceLoadConversations,
    debugConnection,
    forceRestAPI
  ]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};