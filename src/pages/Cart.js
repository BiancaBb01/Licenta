import React from "react";
import "../css/Cart.css"; 
import { Link } from "react-router-dom";

const Cart = ({ cart, setCart }) => {
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  return (
    <div className="cart-page">
      <h1>Coșul de cumpărături</h1>
      
      {cart.length === 0 ? (
        <div className="empty-cart">
          <p>🛒 Coșul este gol!</p>
          <Link to="/products" className="back-to-products">Vezi produsele</Link>
        </div>
      ) : (
        <ul>
          {cart.map((item) => (
            <li key={item.id}>
              <img src={item.image} alt={item.name} className="cart-image" />
              <div className="cart-details">
                <h3>{item.name}</h3>
                <p>{item.price} x {item.quantity}</p>
                <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Șterge</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Cart;

