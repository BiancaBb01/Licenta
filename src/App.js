import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useState, useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "./components/navbar.js";
import Home from "./pages/Home";
import Products from "./pages/Produse.js"; 
import Cart from "./pages/Cart";
import Contact from "./pages/Contact.js";
import AdaugaProdus from "./components/AdaugaProdus.js";
import ProductList from "./components/ProductList.js";

function App() {
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AuthProvider>
      <Router>
        <Navbar cart={cart} setSearchQuery={setSearchQuery} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products cart={cart} setCart={setCart} searchQuery={searchQuery} />} />
          <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/adauga-produs" element={<AdaugaProdus/>}/>
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;
