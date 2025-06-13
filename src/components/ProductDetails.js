import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaFacebook, FaTwitter, FaWhatsapp, FaUser, FaEnvelope } from 'react-icons/fa';
import '../css/ProductDetails.css';
import { useAuth } from '../context/AuthContext'; // Adăugăm acest import

const ProductDetails = ({ cart, setCart }) => {
  const { id } = useParams();
  const { user } = useAuth(); // Pentru a verifica dacă utilizatorul este autentificat
  const navigate = useNavigate(); // Pentru redirecționare
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // În loc să încercăm să accesăm un endpoint specific pentru un singur produs,
        // obținem toate produsele și filtrăm după id
        const response = await axios.get('/api/products');
        const allProducts = response.data;
        
        // Găsim produsul cu ID-ul din parametri
        const foundProduct = allProducts.find(p => p.id.toString() === id.toString());
        
        if (foundProduct) {
          setProduct(foundProduct);
          
          // Găsim produse similare
          const similar = allProducts.filter(p => 
            p.id !== foundProduct.id && 
            (p.category === foundProduct.category || 
             (Array.isArray(p.tags) && Array.isArray(foundProduct.tags) && 
              p.tags.some(tag => foundProduct.tags.includes(tag))))
          ).slice(0, 4);
          
          setSimilarProducts(similar);
        } else {
          setError('Produsul nu a fost găsit.');
        }
        
        // Date de test pentru recenzii
        setReviews([
          { id: 1, user: "Maria", rating: 5, comment: "Produse proaspete și de calitate!", date: "15 April 2025" },
          { id: 2, user: "Ion", rating: 4, comment: "Foarte bun, recomand!", date: "10 April 2025" }
        ]);
        
        setLoading(false);
      } catch (err) {
        console.error('Eroare la încărcarea produsului:', err);
        setError('Nu s-a putut încărca produsul. Încercați din nou mai târziu.');
        setLoading(false);
      }
    };

    fetchProduct();
    // Rulăm la montarea componentei și când se schimbă ID-ul
  }, [id]);

  const addToCart = () => {
    if (!product) return;

    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([
        ...cart,
        {
          ...product,
          quantity: quantity
        }
      ]);
    }
    
    alert(`${quantity} x ${product.name} a fost adăugat în coș!`);
  };
  
  // Funcție pentru contactarea vânzătorului
  // Funcție corectată pentru contactarea vânzătorului
const handleContactSeller = async () => {
  if (!user) {
    // Redirecționează la login dacă utilizatorul nu este autentificat
    navigate('/login');
    return;
  }
  
  try {
    // Verifică dacă utilizatorul nu este propriul vânzător
    if (product.userId && user.id === product.userId) {
      alert('Nu puteți contacta propriul produs!');
      return;
    }
    
    console.log('Creez conversație pentru produs:', {
      sellerId: product.userId,
      productId: product.id,
      productName: product.name
    });
    
    // Creează sau accesează conversația existentă
    const response = await axios.post('/api/messages/conversations', {
      sellerId: product.userId,
      productId: product.id
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Conversație creată cu succes:', response.data);
    
    // ✅ CORECTAT - Redirecționează către pagina corectă de mesaje
    navigate('/messages');
    
  } catch (error) {
    console.error('Eroare detaliată la contactarea vânzătorului:', error);
    
    if (error.response) {
      console.error('Server error:', error.response.data);
      alert(`Eroare server: ${error.response.data.message || 'Verificați conexiunea'}`);
    } else if (error.request) {
      console.error('Network error:', error.request);
      alert('Eroare de rețea. Verificați conexiunea și încercați din nou.');
    } else {
      console.error('Error:', error.message);
      alert('A apărut o eroare neașteptată. Încercați din nou.');
    }
  }
};
  
  // Funcție pentru partajare pe rețele sociale
  const shareUrl = window.location.href;
  const shareTitle = product ? `Descoperă ${product.name} de la Green Garden!` : 'Produse Green Garden';
  
  if (loading) return <div className="loading">Se încarcă produsul...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="error">Produsul nu a fost găsit.</div>;

  return (
    <div className="product-details-container" style={{color: 'black'}}>
      <Link to="/products" className="back-button">← Înapoi la produse</Link>
      
      <div className="product-details">
        <div className="product-details-left">
          {product.imageUrl && (
            <div className="product-details-image">
              <img src={product.imageUrl} alt={product.name} />
            </div>
          )}
          
          {/* Opțiuni de partajare */}
          <div className="product-share">
            <h3>Distribuie produsul</h3>
            <div className="social-share-buttons">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer">
                <FaFacebook size={24} />
              </a>
              <a href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer">
                <FaTwitter size={24} />
              </a>
              <a href={`https://api.whatsapp.com/send?text=${shareTitle} ${shareUrl}`} target="_blank" rel="noopener noreferrer">
                <FaWhatsapp size={24} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="product-details-right">
          <h1 className="product-details-title">{product.name}</h1>
          <p className="product-details-price">{product.price} RON</p>
          
          {product.description && (
            <div className="product-details-description">
              <h3>Descriere</h3>
              <p>{product.description}</p>
            </div>
          )}
          
          <div className="product-details-info">
            {product.category && <p><strong>Categorie:</strong> {product.category}</p>}
            {product.type && <p><strong>Tip:</strong> {product.type}</p>}
            {product.tags?.length > 0 && (
              <p><strong>Etichete:</strong> {Array.isArray(product.tags) ? product.tags.join(', ') : product.tags}</p>
            )}
          </div>
          
          {/* Informații despre vânzător - Secțiune modificată */}
          {product.producer && (
            <div className="seller-info">
              <h3>Despre vânzător</h3>
              <p><strong>Vânzător:</strong> {product.producer}</p>
              {product.location && <p><strong>Locație:</strong> {product.location}</p>}
              {product.phone && <p><strong>Contact:</strong> {product.phone}</p>}
              
              {/* Butoane pentru profilul vânzătorului și contact */}
              <div className="seller-actions">
                {product.userId && (
                  <Link to={`/profile/${product.userId}`} className="view-profile-btn">
                    {/* <FaUser /> */}Vezi profilul vânzătorului 
                  </Link>
                )}
                
                <button 
                  className="contact-seller-btn"
                  onClick={handleContactSeller}
                >
                  <FaEnvelope /> Contactează vânzătorul
                </button>
              </div>
            </div>
          )}
          
          {/* Detalii despre origine și metode de producție */}
          <div className="origin-details">
            <h3>Origine și metode de producție</h3>
            <p>Produs în {product.location || 'România'}, cultivat folosind metode tradiționale și sustenabile, fără pesticide dăunătoare.</p>
            <p>Toate produsele noastre sunt verificate și certificate pentru calitate și prospețime.</p>
          </div>
          
          <div className="product-details-actions">
            <div className="quantity-selector">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            <button className="add-to-cart-button" onClick={addToCart}>
              Adaugă în coș
            </button>
          </div>
        </div>
      </div>
      
      {/* Restul codului rămâne neschimbat */}
      {/* Secțiunea de recenzii */}
      <div className="product-reviews">
        <h2>Recenzii de la clienți</h2>
        {reviews.length > 0 ? (
          <div className="reviews-list">
            {reviews.map(review => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <span className="review-user">{review.user}</span>
                  <span className="review-date">{review.date}</span>
                  <div className="review-rating">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < review.rating ? "star-filled" : "star-empty"}>★</span>
                    ))}
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Nu există încă recenzii pentru acest produs. Fii primul care lasă o părere!</p>
        )}
      </div>
      
      {/* Produse similare */}
      {similarProducts.length > 0 && (
        <div className="similar-products">
          <h2>Produse similare</h2>
          <div className="similar-products-grid">
            {similarProducts.map(similarProduct => (
              <div key={similarProduct.id} className="similar-product-card">
                <Link to={`/product/${similarProduct.id}`}>
                  {similarProduct.imageUrl && (
                    <div className="similar-product-image">
                      <img src={similarProduct.imageUrl} alt={similarProduct.name} />
                    </div>
                  )}
                  <h3>{similarProduct.name}</h3>
                  <p className="similar-product-price">{similarProduct.price} RON</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;