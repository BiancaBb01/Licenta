import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSocketContext } from '../context/SocketContext';
import AdaugaProdus from '../components/AdaugaProdus';
import '../css/MySales.css';

const MySales = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Socket.io from context
  const {
    isConnected,
    sales,
    loadingSales,
    loadSales,
    subscribeToOrders,
    updateOrderStatus,
    getStatusText
  } = useSocketContext();

  // Subscribe to order notifications when component mounts
  useEffect(() => {
    if (isConnected) {
      subscribeToOrders();
      loadSales();
    }
  }, [isConnected, subscribeToOrders, loadSales]);

  // Manual refresh
  const handleRefresh = () => {
    if (isConnected) {
      loadSales();
      toast.info('🔄 Actualizare vânzări...');
    } else {
      toast.warning('❌ Nu sunteți conectat pentru actualizare în timp real');
    }
  };

  // Update order status with Socket.io
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    if (!isConnected) {
      // Fallback to REST API
      updateOrderStatusREST(orderId, newStatus);
      return;
    }

    try {
      // Use Socket.io method
      updateOrderStatus(orderId, newStatus);
      toast.success("✅ Status actualizat în timp real!");
    } catch (error) {
      console.error('Error updating status via Socket.io:', error);
      // Fallback to REST API
      updateOrderStatusREST(orderId, newStatus);
    }
  };

  // Fallback REST API method
  const updateOrderStatusREST = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("✅ Status actualizat cu succes!");
        // Manually reload sales since we're not connected to Socket.io
        loadSales();
      } else {
        toast.error(`❌ ${result.error || 'Eroare la actualizarea statusului'}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("❌ Eroare la actualizarea statusului");
    }
  };

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
        // Reload sales
        loadSales();
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

  const getOrderTotal = (items) => {
    return items.reduce((total, item) => total + parseFloat(item.subtotal), 0);
  };

  const handleAddProduct = () => {
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
  };

  const handleProductAdded = () => {
    console.log('Produs adăugat cu succes!');
    toast.success("✅ Produsul a fost adăugat cu succes!");
    setShowAddForm(false);
    loadSales();
  };

  if (loadingSales) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Se încarcă vânzările...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-sales-container">
      <div className="my-sales-wrapper">
        <div className="my-sales-content">
          
          {/* Enhanced header with real-time status */}
          <div className="my-sales-header">
            <div className="header-main">
              <h1 className="my-sales-title">
                💰 Vânzările mele
              </h1>
              <div className="header-actions">
                <button 
                  onClick={handleRefresh}
                  className="refresh-button"
                  disabled={!isConnected}
                  title={isConnected ? "Actualizează vânzările" : "Nu sunteți conectat"}
                >
                  🔄 Actualizează
                </button>
                <button 
                  onClick={handleAddProduct}
                  className="add-product-btn"
                >
                  ➕ Adaugă produs
                </button>
              </div>
            </div>
            
            <div className="header-info">
              <p className="my-sales-subtitle">
                Urmărește-ți comenzile și gestionează livrările
              </p>
              
              {/* Real-time connection status */}
              <div className={`real-time-status ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? (
                  <>
                    <span className="status-indicator">🟢</span>
                    <span>Notificări în timp real</span>
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
            <div className="sales-stats">
              <div className="stat-item">
                <span className="stat-number">{sales.length}</span>
                <span className="stat-label">Comenzi totale</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {sales.filter(sale => sale.order.status === 'pending').length}
                </span>
                <span className="stat-label">În așteptare</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {sales.filter(sale => sale.order.status === 'shipped').length}
                </span>
                <span className="stat-label">Expediate</span>
              </div>
            </div>
          </div>

          {sales.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📈</div>
              <h3 className="empty-state-title">
                Nu ai încă nicio vânzare
              </h3>
              <p className="empty-state-description">
                Când cineva va comanda produsele tale, le vei vedea aici.
                {isConnected && (
                  <><br/><strong>🟢 Vei primi notificări în timp real!</strong></>
                )}
              </p>
              <button 
                onClick={handleAddProduct}
                className="add-product-btn"
              >
                Adaugă produs nou
              </button>
            </div>
          ) : (
            <div className="sales-list">
              {sales.map((sale) => (
                <div key={sale.order.id} className="sale-card">
                  
                  {/* Enhanced header with real-time indicator */}
                  <div className="sale-header">
                    <div className="sale-info">
                      <div className="sale-title-row">
                        <h3>Comandă #{sale.order.id.slice(-8)}</h3>
                        {isConnected && (
                          <span className="live-badge" title="Actualizări în timp real">
                            🔴 LIVE
                          </span>
                        )}
                      </div>
                      <p className="sale-client-info">
                        <span className="client-icon">👤</span>
                        Client: {sale.order.buyer.name} ({sale.order.buyer.email})
                      </p>
                      <p className="sale-date">
                        <span className="date-icon">📅</span>
                        {new Date(sale.order.createdAt).toLocaleDateString('ro-RO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="sale-status">
                      <span 
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(sale.order.status) + '20',
                          color: getStatusColor(sale.order.status)
                        }}
                      >
                        {getStatusText(sale.order.status)}
                      </span>
                    </div>
                  </div>

                  {/* Products section */}
                  <div className="products-list">
                    {sale.items.map((item, index) => (
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
                            Cantitate comandată: {item.quantity} × {parseFloat(item.priceAtTime).toFixed(2)} RON
                          </p>
                        </div>
                        <div className="product-price">
                          <p className="product-subtotal">
                            +{parseFloat(item.subtotal).toFixed(2)} RON
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer with delivery details and actions */}
                  <div className="sale-footer">
                    
                    {/* Delivery details */}
                    <div className="delivery-details">
                      <h4>📦 Detalii livrare</h4>
                      
                      <div className="delivery-item">
                        <span className="delivery-icon">📍</span>
                        <strong>Adresă:</strong>
                        <span className="delivery-value">
                          {sale.order.deliveryAddress || 'Nu a fost specificată'}
                        </span>
                      </div>
                      
                      <div className="delivery-item">
                        <span className="delivery-icon">📞</span>
                        <strong>Telefon:</strong>
                        <span className="delivery-value">
                          {sale.order.deliveryPhone || 'Nu a fost specificat'}
                        </span>
                      </div>
                      
                      <div className="delivery-item">
                        <span className="delivery-icon">📝</span>
                        <strong>Observații:</strong>
                        <span className="delivery-value">
                          {sale.order.notes || 'Fără observații'}
                        </span>
                      </div>
                      
                      {sale.order.buyer.phone && (
                        <div className="delivery-item">
                          <span className="delivery-icon">👤</span>
                          <strong>Tel. client:</strong>
                          <span className="delivery-value">
                            {sale.order.buyer.phone}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions section */}
                    <div className="sale-actions">
                      <div className="total-earnings">
                        <p className="earnings-label">Câștig total</p>
                        <p className="earnings-amount">
                          {getOrderTotal(sale.items).toFixed(2)} RON
                        </p>
                      </div>
                      
                      {/* Enhanced status selector with real-time updates */}
                      <div className="status-update-section">
                        <label htmlFor={`status-${sale.order.id}`} className="status-label">
                          Status comandă:
                        </label>
                        <select 
                          id={`status-${sale.order.id}`}
                          value={sale.order.status}
                          onChange={(e) => handleUpdateOrderStatus(sale.order.id, e.target.value)}
                          className={`status-select ${isConnected ? 'real-time' : 'offline'}`}
                          disabled={sale.order.status === 'delivered' || sale.order.status === 'cancelled'}
                          title={isConnected ? "Actualizare în timp real" : "Offline - se va actualiza când vă reconectați"}
                        >
                          <option value="pending">În așteptare</option>
                          <option value="confirmed">Confirmată</option>
                          <option value="in_progress">În procesare</option>
                          <option value="shipped">Expediată</option>
                          <option value="delivered">Livrată</option>
                          <option value="cancelled">Anulată</option>
                        </select>
                        {!isConnected && (
                          <span className="offline-indicator" title="Offline">⚠️</span>
                        )}
                      </div>
                      
                      {/* Delete button for shipped orders */}
                      {sale.order.status === 'shipped' && (
                        <button 
                          onClick={() => deleteOrder(sale.order.id)}
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
                <span>Primiți notificări în timp real pentru comenzi noi și actualizări de status</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for adding product */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              onClick={handleCloseForm}
              className="modal-close-btn"
            >
              ✖
            </button>
            <AdaugaProdus onSuccess={handleProductAdded} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MySales;