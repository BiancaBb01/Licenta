import React, { useState } from "react";
import "../css/Cart.css";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CSSTransition, TransitionGroup } from "react-transition-group";

const Cart = ({ cart, setCart }) => {
  const [deletedItemId, setDeletedItemId] = useState(null);

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
    setDeletedItemId(id); // activează animația
    setTimeout(() => {
      setCart(cart.filter((item) => item.id !== id));
      setDeletedItemId(null);
    }, 300); // trebuie să fie sincron cu CSS fadeOut
  };

  const totalCost = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = () => {
    toast.success("✅ Comanda a fost plasată cu succes!");
    setCart([]);
  };

  return (
    <div className="cart-wrapper">
      <ToastContainer position="top-right" autoClose={2000} />
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
                  {/* Imagine */}
                  {item.imageUrl && (
                    <div className="cart-item-left">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="cart-image"
                      />
                    </div>
                  )}

                  {/* Info produs */}
                <div className="cart-item-middle">
                  <h4>{item.name}</h4>
                  <p>Preț unitar: {item.price} RON</p>
                  <p><strong>Subtotal:</strong> {item.price * item.quantity} RON</p>
                  <div className="product-details-horizontal">
                    {item.category && <p><strong className="detail-label">Categorie:</strong> {item.category}</p>}
                    {item.type && <p><strong className="detail-label">Tip:</strong> {item.type}</p>}
                    {item.producer && <p><strong className="detail-label">Producător:</strong> {item.producer}</p>}
                    {item.location && <p><strong className="detail-label"></strong> {item.location}</p>}
                    {item.phone && <p><strong className="detail-label"></strong> {item.phone}</p>}
                    {item.tags?.length > 0 && (
                      <p><strong className="detail-label"></strong> {Array.isArray(item.tags) ? item.tags.join(', ') : item.tags}</p>
                    )}
                    {item.description && <p><strong className="detail-label">Descriere:</strong> {item.description}</p>}
                  </div>
                </div>

                  {/* Controale cantitate + ștergere */}
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
            Total comandă: {totalCost} RON
          </div>

          <div className="place-order-container">
            <button className="place-order-btn" onClick={handlePlaceOrder}>
              Plasează comanda
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;