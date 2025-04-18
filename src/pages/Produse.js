import React from "react";
import "../css/ProductList.css"; 
import ProductList from "../components/ProductList";
import backgroundImage from "../images/fundal.jpg"; // ✅ dacă vrei fundalul

const Products = ({ searchQuery, cart, setCart }) => { 
  return (
    <div>
      <div className="parallax-section">
        <img src={backgroundImage} alt="Produse Green Garden" className="parallax-image" />
        <div className="parallax-overlay"></div>
        <div className="parallax-content">
          <h1>Produsele Noastre</h1>
          <p>Alege cele mai proaspete fructe și legume direct de la fermieri.</p>
        </div>
      </div>

      <section className="products-page">
        <ProductList cart={cart} setCart={setCart}/>
      </section>
    </div>
  );
};

export default Products;
