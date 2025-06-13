import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/ProductCard.css';

const ProductCard = ({ product, addToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity: quantity
    });
    // Resetează cantitatea după adăugare (opțional)
    setQuantity(1);
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.imageUrl} alt={product.name} />
      </div>
      
      <div className="product-info">
        <Link to={`/product/${product.id}`} className="product-name-link">
          <h3 className="product-name">{product.name}</h3>
        </Link>
        
        <p className="product-price">{product.price} RON</p>
        
        {product.category && (
          <p className="product-detail">Categorie: {product.category}</p>
        )}
        
        {/* Controale moderne pentru cantitate */}
        <div className="quantity-controls">
          <button 
            className="quantity-btn" 
            onClick={decreaseQuantity}
          >
            -
          </button>
          <span className="quantity">{quantity}</span>
          <button 
            className="quantity-btn" 
            onClick={increaseQuantity}
          >
            +
          </button>
        </div>
        
        <button 
          className="add-to-cart-button" 
          onClick={handleAddToCart}
        >
          Adaugă în coș
        </button>
      </div>
    </div>
  );
};

export default ProductCard;