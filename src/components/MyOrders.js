import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSocketContext } from '../context/SocketContext';
import '../css/MyOrders.css';

const MyOrders = () => {
  // Socket.io from context
  const {
    isConnected,
    orders,
    loadingOrders,
    loadOrders,
    trackOrder,
    cancelOrder,
    getStatusText
  } = useSocketContext();

  // Local state for order tracking
  const [trackingInfo, setTrackingInfo] = useState({});
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Load orders when connected
  useEffect(() => {
    if (isConnected) {
      loadOrders();
    }
  }, [isConnected, loadOrders]);

  // Manual refresh
  const handleRefresh = () => {
    if (isConnected) {
      loadOrders();
      toast.info('🔄 Actualizare comenzi...');
    } else {
      toast.warning('❌ Nu sunteți conectat pentru actualizare în timp real');
    }
  };

  // Track order with Socket.io
  const handleTrackOrder = (orderId) => {
    if (!isConnected) {
      toast.warning('❌ Nu sunteți conectat pentru tracking în timp real');
      return;
    }

    setSelectedOrderId(orderId);
    trackOrder(orderId);
    setShowTrackingModal(true);
  };

  // Cancel order with Socket.io
  const handleCancelOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setShowCancelModal(true);
  };

  const confirmCancelOrder = () => {
    if (!isConnected) {
      toast.warning('❌ Nu sunteți conectat pentru anulare în timp real');
      return;
    }

    if (!cancelReason.trim()) {
      toast.error('❌ Vă rugăm să specificați motivul anulării');
      return;
    }

    cancelOrder(selectedOrderId, cancelReason.trim());
    setShowCancelModal(false);
    setCancelReason('');
    setSelectedOrderId(null);
    
    toast.success('✅ Cererea de anulare a fost trimisă');
  };

  // Delete order (REST API fallback)
  const deleteOrder = async (orderId) => {
    if (!window.confirm('Ești sigur că vrei să ștergi această comandă? Această acțiune nu poate fi anulată.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("✅ Comanda a fost ștearsă cu succes!");
        loadOrders();
      } else {
        toast.error(`❌ ${result.error || 'Eroare la ștergerea comenzii'}`);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error("❌ Eroare la ștergerea comenzii");
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'pending': '#f59e0b',
      'confirmed': '#3b82f6', 
      'in_progress': '#8b5cf6',
      'shipped': '#6366f1',
      'delivered': '#10b981',
      'cancelled': '#ef4444'
    };
    return statusColors[status] || '#6b7280';
  };

  const getOrderTotal = (order) => {
    if (order.totalAmount) {
      return parseFloat(order.totalAmount);
    }
    if (order.orderItems) {
      return order.orderItems.reduce((total, item) => total + parseFloat(item.subtotal), 0);
    }
    return 0;
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      'pending': '⏳',
      'confirmed': '✅',
      'in_progress': '🔄',
      'shipped': '🚚',
      'delivered': '📦',
      'cancelled': '❌'
    };
    return statusIcons[status] || '📋';
  };

  const canCancelOrder = (order) => {
    return ['pending', 'confirmed'].includes(order.status) && isConnected;
  };

  const canTrackOrder = (order) => {
    return ['confirmed', 'in_progress', 'shipped'].includes(order.status) && isConnected;
  };

  if (loadingOrders) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Se încarcă comenzile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-container">
      <div className="my-orders-wrapper">
        <div className="my-orders-content">
          
          {/* Enhanced header with real-time status */}
          <div className="my-orders-header">
            <div className="header-main">
              <h1 className="my-orders-title">
                📦 Comenzile mele
              </h1>
              <div className="header-actions">
                <button 
                  onClick={handleRefresh}
                  className="refresh-button"
                  disabled={!isConnected}
                  title={isConnected ? "Actualizează comenzile" : "Nu sunteți conectat"}
                >
                  🔄 Actualizează
                </button>
                <a 
                  href="/products" 
                  className="explore-products-btn"
                >
                  🛍️ Explorează produse
                </a>
              </div>
            </div>

            <div className="header-info">
              <p className="my-orders-subtitle">
                Urmărește statusul comenzilor tale și detaliile de livrare
              </p>
              
              {/* Real-time connection status */}
              <div className={`real-time-status ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? (
                  <>
                    <span className="status-indicator">🟢</span>
                    <span>Actualizări în timp real</span>
                  </>
                ) : (
                  <>
                    <span className="status-indicator">🔴</span>
                    <span>Offline - reconnectare...</span>
                  </>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="orders-stats">
              <div className="stat-item">
                <span className="stat-number">{orders.length}</span>
                <span className="stat-label">Comenzi totale</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {orders.filter(order => order.status === 'pending').length}
                </span>
                <span className="stat-label">În așteptare</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {orders.filter(order => order.status === 'shipped').length}
                </span>
                <span className="stat-label">Expediate</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {orders.filter(order => order.status === 'delivered').length}
                </span>
                <span className="stat-label">Livrate</span>
              </div>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🛒</div>
              <h3 className="empty-state-title">
                Nu ai încă nicio comandă
              </h3>
              <p className="empty-state-description">
                Când vei plasa prima comandă, o vei vedea aici.
                {isConnected && (
                  <><br/><strong>🟢 Vei primi notificări în timp real despre statusul comenzilor!</strong></>
                )}
              </p>
              <a 
                href="/products" 
                className="explore-products-btn"
              >
                Explorează produsele
              </a>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  
                  {/* Enhanced header with real-time indicator */}
                  <div className="order-header">
                    <div className="order-info">
                      <div className="order-title-row">
                        <h3>Comanda #{order.id.slice(-8)}</h3>
                        {isConnected && (
                          <span className="live-badge" title="Actualizări în timp real">
                            🔴 LIVE
                          </span>
                        )}
                      </div>
                      <p className="order-date">
                        <span className="date-icon">📅</span>
                        {new Date(order.createdAt).toLocaleDateString('ro-RO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="order-status-section">
                      <span 
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(order.status) + '20',
                          color: getStatusColor(order.status)
                        }}
                      >
                        <span className="status-icon">{getStatusIcon(order.status)}</span>
                        {getStatusText(order.status)}
                      </span>
                      
                      {/* Order actions */}
                      <div className="order-actions">
                        {canTrackOrder(order) && (
                          <button
                            onClick={() => handleTrackOrder(order.id)}
                            className="track-btn"
                            title="Urmărește comanda"
                          >
                            📍 Track
                          </button>
                        )}
                        
                        {canCancelOrder(order) && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="cancel-btn"
                            title="Anulează comanda"
                          >
                            ❌ Anulează
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Products section */}
                  <div className="products-list">
                    {order.orderItems && order.orderItems.map((item) => (
                      <div key={item.id} className="product-item">
                        {item.product && item.product.imageUrl && (
                          <img 
                            src={item.product.imageUrl} 
                            alt={item.product.name}
                            className="product-image"
                          />
                        )}
                        <div className="product-details">
                          <h4 className="product-name">
                            {item.product ? item.product.name : 'Produs șters'}
                          </h4>
                          <p className="product-quantity">
                            Cantitate: {item.quantity} × {parseFloat(item.priceAtTime).toFixed(2)} RON
                          </p>
                          {item.product?.sellerUser && (
                            <p className="product-seller">
                              Vândut de: {item.product.sellerUser.name}
                            </p>
                          )}
                        </div>
                        <div className="product-price">
                          <p className="product-subtotal">
                            {parseFloat(item.subtotal).toFixed(2)} RON
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer with delivery details and total */}
                  <div className="order-footer">
                    
                    {/* Delivery details */}
                    <div className="delivery-details">
                      <h4>🚚 Informații livrare</h4>
                      
                      {order.deliveryAddress && (
                        <div className="delivery-item">
                          <span className="delivery-icon">📍</span>
                          <strong>Adresă:</strong>
                          <span className="delivery-value">
                            {order.deliveryAddress}
                          </span>
                        </div>
                      )}
                      
                      {order.deliveryPhone && (
                        <div className="delivery-item">
                          <span className="delivery-icon">📞</span>
                          <strong>Telefon:</strong>
                          <span className="delivery-value">
                            {order.deliveryPhone}
                          </span>
                        </div>
                      )}
                      
                      {order.notes && (
                        <div className="delivery-item">
                          <span className="delivery-icon">📝</span>
                          <strong>Observații:</strong>
                          <span className="delivery-value">
                            {order.notes}
                          </span>
                        </div>
                      )}
                      
                      {!order.deliveryAddress && !order.deliveryPhone && !order.notes && (
                        <div className="delivery-item">
                          <span className="delivery-icon">ℹ️</span>
                          <span className="delivery-value">
                            Nu sunt disponibile informații suplimentare de livrare
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Total and delete button */}
                    <div className="order-total">
                      <div className="total-section">
                        <p className="total-label">Total comandă</p>
                        <p className="total-amount">
                          {getOrderTotal(order).toFixed(2)} RON
                        </p>
                      </div>
                      
                      {/* Delete button for shipped orders */}
                      {order.status === 'shipped' && (
                        <button 
                          onClick={() => deleteOrder(order.id)}
                          className="delete-order-btn"
                          title="Șterge comanda expediată"
                        >
                          🗑️ Șterge comanda
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Real-time notification area */}
          {isConnected && (
            <div className="real-time-info">
              <div className="real-time-indicator">
                <span className="pulse-dot"></span>
                <span>Primiți notificări în timp real pentru actualizările de status ale comenzilor</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order tracking modal */}
      {showTrackingModal && (
        <div className="modal-overlay">
          <div className="modal-content tracking-modal">
            <div className="modal-header">
              <h3>📍 Urmărire comandă #{selectedOrderId?.slice(-8)}</h3>
              <button 
                onClick={() => setShowTrackingModal(false)}
                className="modal-close-btn"
              >
                ✖
              </button>
            </div>
            
            <div className="tracking-content">
              <div className="tracking-info">
                <p>Informațiile de tracking vor fi afișate aici în timp real.</p>
                <p>Status-ul comenzii se actualizează automat.</p>
              </div>
              
              {trackingInfo[selectedOrderId] && (
                <div className="tracking-timeline">
                  {/* Display tracking timeline here */}
                  <p>Timeline tracking pentru comanda {selectedOrderId}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel order modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-content cancel-modal">
            <div className="modal-header">
              <h3>❌ Anulare comandă #{selectedOrderId?.slice(-8)}</h3>
              <button 
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedOrderId(null);
                }}
                className="modal-close-btn"
              >
                ✖
              </button>
            </div>
            
            <div className="cancel-content">
              <p>Vă rugăm să specificați motivul anulării comenzii:</p>
              
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Motivul anulării..."
                className="cancel-reason-input"
                rows={4}
              />
              
              <div className="cancel-actions">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                    setSelectedOrderId(null);
                  }}
                  className="cancel-btn-secondary"
                >
                  Renunță
                </button>
                <button
                  onClick={confirmCancelOrder}
                  className="confirm-cancel-btn"
                  disabled={!cancelReason.trim() || !isConnected}
                >
                  {isConnected ? 'Confirmă anularea' : 'Offline - nu se poate anula'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;