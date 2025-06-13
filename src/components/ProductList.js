import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from "../components/ProductCard.js"
import '../css/ProductList.css';
import { Link } from 'react-router-dom';
import { FaOptinMonster } from 'react-icons/fa';

const ProductList = ({ searchQuery, cart, setCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Eroare la încărcarea produselor:', err);
        setError('Nu s-au putut încărca produsele. Încearcă din nou mai târziu.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filtrarea produselor după query
  const filteredProducts = products.filter(product => {
    if (!searchQuery || searchQuery.trim() === '') {
      return true; // Arătăm toate produsele dacă nu există query
    }
    
    const query = searchQuery.toLowerCase().trim();
    
    // Verificăm dacă query-ul se potrivește cu numele produsului
    if (product.name && product.name.toLowerCase().includes(query)) {
      return true;
    }
    
    // Verificăm dacă query-ul se potrivește cu tag-urile produsului
    if (product.tags) {
      // Verificăm dacă tags este un array sau un string
      if (Array.isArray(product.tags)) {
        return product.tags.some(tag => 
          tag.toLowerCase().includes(query)
        );
      } else if (typeof product.tags === 'string') {
        return product.tags.toLowerCase().includes(query);
      }
    }
    
    // Verificăm și alte câmpuri relevante
    if (product.category && product.category.toLowerCase().includes(query)) {
      return true;
    }
    
    if (product.type && product.type.toLowerCase().includes(query)) {
      return true;
    }
    
    if (product.description && product.description.toLowerCase().includes(query)) {
      return true;
    }
    
    return false;
  });

  const addToCart = (product, quantity=1) => {
    // Verificăm dacă produsul există deja în coș
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      // Dacă există, incrementăm cantitatea
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      // Dacă nu există, îl adăugăm cu cantitatea 1
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          category: product.category || '',
          type: product.type || '',
          producer: product.producer || '',
          location: product.location || '',
          phone: product.phone || '',
          tags: product.tags || [],
          description: product.description || '', // asiguri că ajunge în coș
          quantity: 1
        }
      ]);
    }
    
    // Feedback vizual
    alert(`${product.name} a fost adăugat în coș (${quantity} bucăți)!`);
  };

  if (loading) return <div className="loading">Se încarcă produsele...</div>;
  if (error) return <div className="error">{error}</div>;
  
  // Verificăm dacă există produse filtrate
  if (filteredProducts.length === 0) {
    if (searchQuery && searchQuery.trim() !== '') {
      return <div className="no-results">Nu am găsit produse pentru căutarea "{searchQuery}"</div>;
    }
    return <div>Nu există produse disponibile.</div>;
  }

  return (
    <div className="product-list">
      <h2>Produse disponibile</h2>
      
      {/* Indicator pentru căutare */}
      {searchQuery && searchQuery.trim() !== '' && (
        <p className="search-results">Rezultate pentru: "{searchQuery}"</p>
      )}
      
      <div className="products-container">
        {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} addToCart={addToCart} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;