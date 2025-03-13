import React, { useState } from "react";
import "../css/Produse.css"; 
import backgroundImage from "../images/fundal.jpg"; 
import defaultImage1 from "../images/rosii.jpg";
import defaultImage2 from "../images/salata.jpg"; 
import defaultImage3 from "../images/capsuni.jpg";

const initialProducts = [
  {
    id: 1,
    name: "Roșii Organice",
    price: "10 RON/kg",
    producer: "Ferma EcoFresh",
    seller: "Ion Popescu",
    phone: "0740 123 456",
    location: "Iași, România",
    tags: ["legumă", "rosii", "eco", "Iasi"],
    image: defaultImage1,
  },
  {
    id: 2,
    name: "Salată Verde",
    price: "5 RON/buc",
    producer: "Fermierul Andrei",
    seller: "Ion Popescu",
    phone: "0722 987 654",
    location: "Cluj, România",
    type: "legume",
    category: "sala verde",
    image: defaultImage2,
  },
  {
    id: 3,
    name: "Căpșuni Proaspete",
    price: "15 RON/kg",
    producer: "Ferma BioGarden",
    seller: "Ion Popescu",
    phone: "0765 345 678",
    location: "Brașov, România",
    image: defaultImage3,
  },

  {
    id: 3,
    name: "Căpșuni Proaspete",
    price: "15 RON/kg",
    producer: "Ferma BioGarden",
    seller: "Ion Popescu",
    phone: "0765 345 678",
    location: "Brașov, România",
    type: "fructe",
    category: "capsuni",
    image: defaultImage3,
  },
  {
    id: 3,
    name: "Mere Verzi",
    price: "5 RON/kg",
    producer: "Ferma BioGarden",
    seller: "Ion Popescu",
    phone: "0765 345 678",
    location: "Brașov, România",
    type: "fructe",
    category: "mere verzi",
    image: defaultImage3,
  },
  {
    id: 3,
    name: "Ciase",
    price: "15 RON/kg",
    producer: "Ferma BioGarden",
    seller: "Ion Popescu",
    phone: "0765 345 678",
    location: "Brașov, România",
    type: "fructe",
    category: "caise",
    image: defaultImage3,
  },
  {
    id: 3,
    name: "Morcov",
    price: "15 RON/kg",
    producer: "Ferma BioGarden",
    seller: "Ion Popescu",
    phone: "0765 345 678",
    location: "Brașov, România",
    type: "leguma",
    category: "morcov",
    image: defaultImage3,
  },
  {
    id: 3,
    name: "Varza",
    price: "15 RON/kg",
    producer: "Ferma BioGarden",
    seller: "Ion Popescu",
    phone: "0765 345 678",
    location: "Brașov, România",
    typ: "leguma",
    category: "varza",
    image: defaultImage3,
  }
];


const Products = ({ searchQuery, cart, setCart }) => { 
  // Funcție pentru a adăuga produse în coș
  const addToCart = (product) => {
    const existingProduct = cart.find((item) => item.id === product.id);

    if (existingProduct) {
      setCart(cart.map((item) =>
        item.id === product.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Filtrare produse după căutare
  const filteredProducts = initialProducts.filter((product) => {
    return searchQuery
      ? product.tags &&
        product.tags.some((tag) => tag?.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
  });

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
        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <img src={product.image} alt={product.name} className="product-image" />
                <div className="product-details">
                  <h3>{product.name}</h3>
                  <p className="product-price">{product.price}</p>
                  <p><strong>Producător:</strong> {product.producer}</p>
                  <p><strong>Vânzător:</strong> {product.seller}</p>
                  <p><strong>Locație:</strong> {product.location}</p>
                  <p><strong>Telefon:</strong> <a href={`tel:${product.phone}`}>{product.phone}</a></p>

                  <button className="add-to-cart" onClick={() => addToCart(product)}>
                    Adaugă în Coș
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-results">❌ Nu am găsit produse care să corespundă căutării tale.</p>
        )}
      </section>
    </div>
  );
};

export default Products;

