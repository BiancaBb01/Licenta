import React from 'react';
import "../../src/css/home.css";
import backgroundImage from '../images/fundal.jpg'; // Imaginea de fundal
import rosii from '../images/rosii.jpg';
import salata from '../images/salata.jpg';
import capsuni from '../images/capsuni.jpg';
import descriptionImage from '../images/fruits.jpg'; // Imaginea pentru secțiunea despre site
import FormContact from '../components/FormContact';
// Datele produselor
const products = [
  {
    id: 1,
    name: "Roșii Organice",
    description: "Savurează dulceața naturală a roșiilor noastre organice.",
    image: rosii,
  },
  {
    id: 2,
    name: "Salată Verde",
    description: "Oferă prospețime preparatelor tale cu salata noastră crocantă.",
    image: salata,
  },
  {
    id: 3,
    name: "Căpșuni Proaspete",
    description: "Bucură-te de dulceața căpșunilor noastre proaspete.",
    image: capsuni,
  }
];

const Home = () => {
  return (
    <div>
      {/* Secțiunea Parallax */}
      <div className="parallax-section">
        <img src={backgroundImage} alt="Green Garden" className="parallax-image" />
        <div className="parallax-overlay"></div>
        <div className="parallax-content">
          <h1>Green Garden</h1>
          <p>Fructe și legume proaspete, direct de la producători</p>
          <button className="explore-button">View Products</button>
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

      {/* Secțiunea cu produse */}
      <section className="product-summary">
        <h2>Descoperă fructele și legumele noastre</h2>
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img src={product.image} alt={product.name} className="product-image" />
              <div className="product-info">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <a href={`/products/${product.id}`} className="product-link">Vezi detalii →</a>
              </div>
            </div>
          ))}
        </div>
      </section>
      <FormContact/>
    </div>
  );
};

export default Home;
