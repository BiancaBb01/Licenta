import React, { useState } from "react";
import "../css/Cart.css";
import { Link } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { toast } from 'react-toastify';

// Componenta Modal pentru detaliile de livrare
const DeliveryDetailsModal = ({ isOpen, onClose, onConfirm, cart, totalCost }) => {
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.address.trim()) {
      newErrors.address = 'Adresa de livrare este obligatorie';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Numărul de telefon este obligatoriu';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Numărul de telefon trebuie să aibă 10 cifre';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onConfirm(formData);
      setFormData({
        address: '',
        phone: '',
        notes: ''
      });
      setErrors({});
    }
  };

  const handleClose = () => {
    onClose();
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '30px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>📦 Detalii de livrare</h2>
          <button 
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '25px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Rezumatul comenzii:</h3>
          <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
            {cart.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                <span>{item.name} × {item.quantity}</span>
                <span>{(item.price * item.quantity).toFixed(2)} RON</span>
              </div>
            ))}
          </div>
          <div style={{
            borderTop: '1px solid #ddd',
            paddingTop: '15px',
            marginTop: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            <span>Total:</span>
            <span>{totalCost.toFixed(2)} RON</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Adresa de livrare *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Ex: Strada Florilor nr. 123, Apt. 4, Iași, Județul Iași"
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: errors.address ? '1px solid #e74c3c' : '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
            {errors.address && (
              <p style={{ color: '#e74c3c', fontSize: '12px', margin: '5px 0 0 0' }}>
                {errors.address}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Număr de telefon *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Ex: 0721234567"
              style={{
                width: '100%',
                padding: '12px',
                border: errors.phone ? '1px solid #e74c3c' : '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            {errors.phone && (
              <p style={{ color: '#e74c3c', fontSize: '12px', margin: '5px 0 0 0' }}>
                {errors.phone}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Observații (opțional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Ex: Livrez după ora 18:00, bloc fără lift, etc."
              rows={2}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #ddd',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Anulează
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                backgroundColor: '#28a745',
                color: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Plasează comanda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Cart = ({ cart, setCart }) => {
  const [deletedItemId, setDeletedItemId] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
  });
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  const showNotification = (message) => {
    setNotification({
      show: true,
      message: message,
    });
    
    setTimeout(() => {
      setNotification({
        show: false,
        message: "",
      });
    }, 3000);
  };

  const increaseQuantity = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeFromCart = (id) => {
    setDeletedItemId(id);
    setTimeout(() => {
      setCart(cart.filter((item) => item.id !== id));
      setDeletedItemId(null);
    }, 300);
  };

  const totalCost = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Funcția pentru plasarea comenzii cu detalii de livrare
  const handlePlaceOrderWithDetails = async (deliveryDetails) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("❌ Trebuie să te loghezi pentru a plasa o comandă!");
        return;
      }

      if (cart.length === 0) {
        toast.error("❌ Coșul este gol!");
        return;
      }

      const orderData = {
        products: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        totalAmount: totalCost,
        deliveryAddress: deliveryDetails.address,
        deliveryPhone: deliveryDetails.phone,
        notes: deliveryDetails.notes
      };

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("✅ Comanda a fost plasată cu succes!");
        console.log('Order created:', result.order);
        
        setCart([]);
        setShowDeliveryModal(false);
        showNotification("✅ Comanda a fost plasată cu succes!");
        
      } else {
        toast.error(`❌ ${result.error || 'A apărut o eroare la plasarea comenzii!'}`);
        console.error('Order creation failed:', result);
      }

    } catch (error) {
      console.error('Error placing order:', error);
      toast.error("❌ A apărut o eroare la plasarea comenzii!");
    }
  };

  // Funcția simplă pentru comandă rapidă (fără detalii)
  const handleQuickOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("❌ Trebuie să te loghezi pentru a plasa o comandă!");
        return;
      }

      if (cart.length === 0) {
        toast.error("❌ Coșul este gol!");
        return;
      }

      const orderData = {
        products: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        totalAmount: totalCost,
        deliveryAddress: "",
        deliveryPhone: "",
        notes: ""
      };

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("✅ Comanda a fost plasată cu succes!");
        setCart([]);
        showNotification("✅ Comanda a fost plasată cu succes!");
      } else {
        toast.error(`❌ ${result.error || 'A apărut o eroare la plasarea comenzii!'}`);
      }

    } catch (error) {
      console.error('Error placing order:', error);
      toast.error("❌ A apărut o eroare la plasarea comenzii!");
    }
  };

  return (
    <div className="cart-wrapper">
      {notification.show && (
        <div className="custom-notification">
          <div className="notification-content">
            <span>{notification.message}</span>
            <button onClick={() => setNotification({ show: false, message: "" })}>×</button>
          </div>
        </div>
      )}
      
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        🛒 Coșul de cumpărături
      </h2>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <p>Coșul este gol!</p>
          <Link to="/products" className="btn-go-to-products">
            Vezi produsele
          </Link>
        </div>
      ) : (
        <>
          <TransitionGroup>
            {cart.map((item) => (
              <CSSTransition
                key={item.id}
                timeout={300}
                classNames="fade"
                in={deletedItemId !== item.id}
              >
                <div className="cart-item">
                  {item.imageUrl && (
                    <div className="cart-item-left">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="cart-image"
                      />
                    </div>
                  )}

                  <div className="cart-item-middle">
                    <h4>{item.name}</h4>
                    <p>Preț unitar: {item.price} RON</p>
                    <p><strong>Subtotal:</strong> {item.price * item.quantity} RON</p>
                  </div>

                  <div className="cart-item-right">
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() => decreaseQuantity(item.id)}
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => increaseQuantity(item.id)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Șterge
                    </button>
                  </div>
                </div>
              </CSSTransition>
            ))}
          </TransitionGroup>

          <div className="cart-total">
            Total comandă: {totalCost.toFixed(2)} RON
          </div>

          <div className="place-order-container">
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <button 
                className="place-order-btn" 
                onClick={handleQuickOrder}
                style={{ 
                  flex: 1,
                  backgroundColor: '#6c757d',
                  border: 'none',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                disabled={cart.length === 0}
              >
                Comandă rapidă
              </button>
              
              <button 
                className="place-order-btn" 
                onClick={() => setShowDeliveryModal(true)}
                style={{ 
                  flex: 1,
                  backgroundColor: '#28a745',
                  border: 'none',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                disabled={cart.length === 0}
              >
                Comandă cu detalii
              </button>
            </div>
          </div>
        </>
      )}

      <DeliveryDetailsModal
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        onConfirm={handlePlaceOrderWithDetails}
        cart={cart}
        totalCost={totalCost}
      />
    </div>
  );
};

export default Cart;