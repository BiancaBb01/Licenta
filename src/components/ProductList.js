import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/ProductList.css';

const ProductList = ({ cart, setCart }) => {
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

  const addToCart = (product) => {
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
          description: product.description || '', // 👈 asiguri că ajunge în coș
          quantity: 1
        }
      ]);
    }

    // Opțional: poți adăuga o notificare sau un feedback vizual
    alert(`${product.name} a fost adăugat în coș!`);
  };

  if (loading) return <div className="loading">Se încarcă produsele...</div>;
  if (error) return <div className="error">{error}</div>;
  if (products.length === 0) return <div>Nu există produse disponibile.</div>;

  return (
    <div className="product-list">
      <h2>Produse disponibile</h2>
      <div className="products-container">
        {products.map(product => (
          <div key={product.id} className="product-card">
            {/* Imagine din URL sau din fișier */}
            {product.imageUrl && (
              <div className="product-image">
                <img src={product.imageUrl} alt={product.name} />
              </div>
            )}

            <h3>{product.name}</h3>
            <p className="product-price">{product.price} RON</p>

            {product.category && <p className="product-category">Categorie: {product.category}</p>}
            {product.type && <p className="product-category">Tip: {product.type}</p>}
            {product.producer && <p className="product-category">Producător: {product.producer}</p>}
            {product.location && <p className="product-category">Locație: {product.location}</p>}
            {product.phone && <p className="product-category">Telefon: {product.phone}</p>}
            {product.tags?.length > 0 && (
              <p className="product-category">Etichete: {Array.isArray(product.tags) ? product.tags.join(', ') : product.tags}</p>
            )}

            {product.description && (
              <p className="product-description">{product.description}</p>
            )}

            <button
              className="add-to-cart"
              onClick={() => addToCart(product)}
            >
              Adaugă în coș
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;