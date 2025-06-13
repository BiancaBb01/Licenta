import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../../src/css/home.css";
import backgroundImage from '../images/fundal.jpg'; // Imaginea de fundal
import descriptionImage from '../images/fruits.jpg'; // Imaginea pentru secțiunea despre site
import FormContact from '../components/FormContact';
import ProductCard from '../components/ProductCard'; // Importă ProductCard
import BulletproofLeafletMap from '../components/Map'; // Importă harta producătorilor
import { useNavigate } from 'react-router-dom';

const Home = ({ cart, setCart }) => { // Primește cart și setCart ca props
  const [homeProducts, setHomeProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        const response = await axios.get('/api/products?limit=3'); // Fetch doar câteva produse pentru pagina de home (ajustează numărul după nevoie)
        setHomeProducts(response.data.slice(0,7));
        setLoading(false);
      } catch (err) {
        console.error('Eroare la încărcarea produselor pentru Home:', err);
        setError('Nu s-au putut încărca produsele. Încearcă din nou mai târziu.');
        setLoading(false);
      }
    };

    fetchHomeProducts();
  }, []);

  const addToCart = (product, quantity = 1) => {
    // Verificăm dacă produsul există deja în coș
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      // Dacă există, incrementăm cantitatea
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      // Dacă nu există, îl adăugăm cu cantitatea specificată
      setCart([
        ...cart,
        { ...product, quantity }
      ]);
    }

    // Feedback vizual
    alert(`${product.name} a fost adăugat în coș (${quantity} bucăți)!`);
  };

  if (loading) return <div className="loading">Se încarcă produsele...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      {/* Secțiunea Parallax */}
      <div className="parallax-section">
        <img src={backgroundImage} alt="Green Garden" className="parallax-image" />
        <div className="parallax-overlay"></div>
        <div className="parallax-content">
          <h1>Green Garden</h1>
          <p>Fructe și legume proaspete, direct de la producători</p>
          <button className="explore-button" onClick={() => navigate("/products")}>View Products</button>
        </div>
      </div>

      {/* Secțiunea de Prezentare */}
      <section className="about-section">
        <div className="about-text">
          <h3 className="green-title">PRODUSE LOCALE PENTRU TINE</h3>
          <h2>Cultivat local, livrat proaspăt</h2>
          <p>
            Green Garden este destinația ta principală pentru fructe și legume proaspete în Iași, România.
            Conectăm fermierii locali cu clienți care apreciază calitatea și sustenabilitatea.
          </p>
          <p>
            Platforma noastră oferă o gamă variată de produse, toate provenite de la cultivatori de încredere.
            Bucură-te de comoditatea cumpărăturilor online în timp ce sprijini comunitatea locală. Experimentează
            gustul prospețimii livrat direct la masa ta.
          </p>
          <a href="/contact" className="about-link">Contactează-ne</a>
        </div>
        <div className="about-image">
          <img src={descriptionImage} alt="Fructe și legume proaspete" />
        </div>
      </section>

      {/* Secțiunea cu Harta Producătorilor */}
      <section className="producers-map-section">
        <div className="producers-content">
          <h3 className="green-title">REȚEAUA NOASTRĂ</h3>
          <h2>Producători din toată România</h2>
          <p>
            Descoperă harta producătorilor noștri - fermieri pasionați care îți aduc cele mai proaspete produse
            direct din grădinile și livezile lor. De la Maramureș la Dobrogea, avem parteneri în toate zonele țării.
          </p>
        </div>
        <div className="map-container">
          <BulletproofLeafletMap compact={true} height={600}/>
        </div>
      </section>

      {/* Secțiunea cu produse */}
      <section className="product-summary">
        <h2>Descoperă o parte din produsele noastre</h2>
        <div className="product-grid">
          {homeProducts.map((product) => (
            <ProductCard key={product.id} product={product} addToCart={addToCart} />
          ))}
        </div>
      </section>
      <FormContact />
    </div>
  );
};

export default Home;