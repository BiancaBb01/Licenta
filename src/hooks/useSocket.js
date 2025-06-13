// hooks/useSocket.js
import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-toastify';

const useSocket = (token, user) => {
  // Estados do Socket
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Estados para mensagens
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  
  // Estados para notificații
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  
  // Estados para comenzi
  const [orders, setOrders] = useState([]);
  const [sales, setSales] = useState([]);
  
  // Estados para loading
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);
  
  const reconnectTimeoutRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ========================================
  // SOCKET CONNECTION
  // ========================================

  useEffect(() => {
    if (!token || !user) return;

    console.log('🔌 Connecting to Socket.io...');
    
    const newSocket = io('http://localhost:5000', {
      auth: { token: token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Connected to Socket.io');
      setIsConnected(true);
      setSocket(newSocket);
      
      // Clear any reconnection timeouts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      toast.success('🔗 Conectat la server', { autoClose: 2000 });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from Socket.io:', reason);
      setIsConnected(false);
      
      // Don't show reconnecting toast for manual disconnections
      if (reason !== 'io client disconnect') {
        toast.warn('🔄 Reconectare...', { autoClose: 3000 });
        
        // Auto-reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          newSocket.connect();
        }, 5000);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setIsConnected(false);
      toast.error('❌ Eroare de conexiune', { autoClose: 3000 });
    });

    // ========================================
    // CONVERSATION EVENTS
    // ========================================

    newSocket.on('conversationsList', (socketConversations) => {
      console.log('📋 Received conversations from Socket.io:', socketConversations);
      setConversations(socketConversations);
      setLoadingConversations(false);
    });

    newSocket.on('conversationCreated', (data) => {
      console.log('🆕 New conversation created:', data);
      
      if (data.isInitiator) {
        toast.success(`💬 Conversație începută cu ${data.conversation.seller?.name || data.conversation.buyer?.name}`);
      } else {
        toast.info(`💬 ${data.conversation.buyer?.name || data.conversation.seller?.name} a început o conversație cu tine`);
      }
      
      // Reload conversations
      loadConversations();
    });

    newSocket.on('conversationJoined', (data) => {
      console.log('🚪 Joined conversation:', data.conversationId);
      setMessages(data.messages);
    });

    newSocket.on('newMessage', (message) => {
      console.log('💬 New message received:', message);
      
      // Add to messages if it's the active conversation
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        if (prev.find(m => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
      
      // Show toast notification if message is not from current user
      if (message.senderId !== user?.id) {
        toast.info(`💬 ${message.senderName}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`, {
          autoClose: 4000,
          onClick: () => {
            // You can add logic to navigate to the conversation here
          }
        });
      }
      
      // Reload conversations to update last message
      loadConversations();
    });

    newSocket.on('userTyping', ({ userName, isTyping, userId }) => {
      if (userId === user?.id) return; // Don't show our own typing
      
      setTypingUsers(prev => {
        if (isTyping) {
          return prev.includes(userName) ? prev : [...prev, userName];
        } else {
          return prev.filter(u => u !== userName);
        }
      });
    });

    newSocket.on('messagesMarkedAsRead', (data) => {
      console.log('📖 Messages marked as read:', data);
      // You can update UI to show read status
    });

    // ========================================
    // ORDER EVENTS
    // ========================================

    newSocket.on('newOrder', (orderData) => {
      console.log('🛒 New order received:', orderData);
      
      toast.success(`🛒 Comandă nouă de la ${orderData.buyer.name}!`, {
        autoClose: 5000,
        onClick: () => {
          // Navigate to sales page
          window.location.href = '/my-sales';
        }
      });
      
      // Add to sales list
      setSales(prev => [orderData, ...prev]);
      
      // Reload sales to get full data
      loadSales();
    });

    newSocket.on('orderStatusUpdated', (data) => {
      console.log('📦 Order status updated:', data);
      
      const statusText = getStatusText(data.newStatus);
      toast.info(`📦 Comanda #${data.orderId.slice(-8)} este acum: ${statusText}`, {
        autoClose: 4000
      });
      
      // Update orders list
      setOrders(prev => prev.map(order => 
        order.id === data.orderId 
          ? { ...order, status: data.newStatus }
          : order
      ));
      
      // Update sales list
      setSales(prev => prev.map(sale => 
        sale.order?.id === data.orderId 
          ? { ...sale, order: { ...sale.order, status: data.newStatus } }
          : sale
      ));
    });

    newSocket.on('orderHidden', (data) => {
      console.log('🗑️ Order hidden:', data);
      toast.info('🗑️ Comandă ascunsă din listă');
    });

    newSocket.on('orderCancelled', (data) => {
      console.log('❌ Order cancelled:', data);
      toast.warning(`❌ Comanda #${data.orderId.slice(-8)} a fost anulată`);
      
      // Update order status
      setOrders(prev => prev.map(order => 
        order.id === data.orderId 
          ? { ...order, status: 'cancelled' }
          : order
      ));
    });

    // ========================================
    // NOTIFICATION EVENTS
    // ========================================

    newSocket.on('notificationsList', (socketNotifications) => {
      console.log('🔔 Received notifications:', socketNotifications);
      setNotifications(socketNotifications);
      const unreadCount = socketNotifications.filter(n => !n.isRead).length;
      setUnreadNotifications(unreadCount);
    });

    newSocket.on('newNotification', (notification) => {
      console.log('🔔 New notification:', notification);
      setNotifications(prev => [notification, ...prev]);
      
      if (!notification.isRead) {
        setUnreadNotifications(prev => prev + 1);
      }
      
      // Show toast based on notification type
      showNotificationToast(notification);
    });

    newSocket.on('notificationUpdated', (updatedNotification) => {
      setNotifications(prev => 
        prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
      );
      
      if (updatedNotification.isRead) {
        setUnreadNotifications(prev => Math.max(0, prev - 1));
      }
    });

    newSocket.on('allNotificationsMarkedAsRead', () => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadNotifications(0);
    });

    newSocket.on('notificationDeleted', ({ notificationId }) => {
      setNotifications(prev => {
        const notification = prev.find(n => n.id === notificationId);
        const newNotifications = prev.filter(n => n.id !== notificationId);
        
        if (notification && !notification.isRead) {
          setUnreadNotifications(prev => Math.max(0, prev - 1));
        }
        
        return newNotifications;
      });
    });

    newSocket.on('allNotificationsCleared', () => {
      setNotifications([]);
      setUnreadNotifications(0);
    });

    // ========================================
    // ERROR EVENTS
    // ========================================

    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      toast.error(`❌ ${error.message || 'Eroare Socket.io'}`, { autoClose: 3000 });
    });

    // Cleanup
    return () => {
      console.log('🔌 Disconnecting Socket.io...');
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      newSocket.disconnect();
    };
  }, [token, user]);

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  const showNotificationToast = (notification) => {
    switch (notification.type) {
      case 'new_message':
        toast.info(`💬 ${notification.data.senderName}: ${notification.data.message.content.substring(0, 50)}...`, {
          autoClose: 4000
        });
        break;
      case 'conversation_started':
        toast.info(`🆕 ${notification.data.buyerName} a început o conversație cu tine`, {
          autoClose: 4000
        });
        break;
      case 'new_order':
        toast.success(`🛒 Comandă nouă de ${notification.data.orderTotal} RON de la ${notification.data.buyerName}!`, {
          autoClose: 5000
        });
        break;
      case 'order_status_update':
        toast.info(`📦 Comanda ta este acum: ${getStatusText(notification.data.newStatus)}`, {
          autoClose: 4000
        });
        break;
      default:
        toast.info('🔔 Notificare nouă', { autoClose: 3000 });
    }
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'pending': 'În așteptare',
      'confirmed': 'Confirmată',
      'in_progress': 'În procesare',
      'shipped': 'Expediată',
      'delivered': 'Livrată',
      'cancelled': 'Anulată'
    };
    return statusTexts[status] || status;
  };

  // ========================================
  // SOCKET METHODS
  // ========================================

  const loadConversations = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('getConversations');
    }
  }, [socket, isConnected]);

  const loadNotifications = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('getNotifications');
    }
  }, [socket, isConnected]);

  const loadOrders = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('getOrders');
    }
  }, [socket, isConnected]);

  const loadSales = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders/my-sales', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        setSales(result.sales);
      }
      setLoadingSales(false);
    } catch (error) {
      console.error('Error loading sales:', error);
      setLoadingSales(false);
    }
  }, []);

  const loadOrdersREST = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders/my-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        setOrders(result.orders);
      }
      setLoadingOrders(false);
    } catch (error) {
      console.error('Error loading orders:', error);
      setLoadingOrders(false);
    }
  }, []);

  // Auto-load data when connected
  useEffect(() => {
    if (socket && isConnected) {
      loadConversations();
      loadNotifications();
      loadSales();
      loadOrdersREST();
      
      // Subscribe to order notifications if user might be a seller
      socket.emit('subscribeToOrders');
    }
  }, [socket, isConnected, loadConversations, loadNotifications, loadSales, loadOrdersREST]);

  // ========================================
  // CONVERSATION METHODS
  // ========================================

  const joinConversation = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit('joinConversation', { conversationId });
    }
  }, [socket, isConnected]);

  const leaveConversation = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit('leaveConversation', { conversationId });
    }
  }, [socket, isConnected]);

  const sendMessage = useCallback((conversationId, content) => {
    if (socket && isConnected) {
      socket.emit('sendMessage', { conversationId, content });
    }
  }, [socket, isConnected]);

  const startTyping = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit('typing', { conversationId, isTyping: true });
      
      // Auto stop typing after 3 seconds
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { conversationId, isTyping: false });
      }, 3000);
    }
  }, [socket, isConnected]);

  const stopTyping = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit('typing', { conversationId, isTyping: false });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  }, [socket, isConnected]);

  const startProductConversation = useCallback((productId, sellerId) => {
    if (socket && isConnected) {
      socket.emit('startProductConversation', { productId, sellerId });
    }
  }, [socket, isConnected]);

  // ========================================
  // ORDER METHODS
  // ========================================

  const subscribeToOrders = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('subscribeToOrders');
    }
  }, [socket, isConnected]);

  const updateOrderStatus = useCallback((orderId, newStatus) => {
    if (socket && isConnected) {
      socket.emit('updateOrderStatus', { orderId, newStatus });
    }
  }, [socket, isConnected]);

  const trackOrder = useCallback((orderId) => {
    if (socket && isConnected) {
      socket.emit('trackOrder', { orderId });
    }
  }, [socket, isConnected]);

  const cancelOrder = useCallback((orderId, reason) => {
    if (socket && isConnected) {
      socket.emit('cancelOrder', { orderId, reason });
    }
  }, [socket, isConnected]);

  // ========================================
  // NOTIFICATION METHODS
  // ========================================

  const markNotificationAsRead = useCallback((notificationId) => {
    if (socket && isConnected) {
      socket.emit('markNotificationAsRead', { notificationId });
    }
  }, [socket, isConnected]);

  const markAllNotificationsAsRead = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('markAllNotificationsAsRead');
    }
  }, [socket, isConnected]);

  const deleteNotification = useCallback((notificationId) => {
    if (socket && isConnected) {
      socket.emit('deleteNotification', { notificationId });
    }
  }, [socket, isConnected]);

  const clearAllNotifications = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('clearAllNotifications');
    }
  }, [socket, isConnected]);

  // ========================================
  // RETURN HOOK INTERFACE
  // ========================================

  return {
    // Connection state
    socket,
    isConnected,
    
    // Data state
    conversations,
    messages,
    orders,
    sales,
    notifications,
    unreadNotifications,
    typingUsers,
    
    // Loading states
    loadingConversations,
    loadingOrders,
    loadingSales,
    
    // Manual loaders
    loadConversations,
    loadNotifications,
    loadOrders: loadOrdersREST,
    loadSales,
    
    // Conversation methods
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    startProductConversation,
    
    // Order methods
    subscribeToOrders,
    updateOrderStatus,
    trackOrder,
    cancelOrder,
    
    // Notification methods
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    
    // Utility methods
    getStatusText
  };
};

export default useSocket;