import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext"; // ✅ ADĂUGAT - Socket.io Context
import { useState, useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ✅ ADĂUGAT - CSS pentru Socket.io
import './css/Socket.css';

import Navbar from "./components/navbar.js";
import Home from "./pages/Home";
import Products from "./pages/Produse.js"; 
import Cart from "./pages/Cart";
import Contact from "./pages/Contact.js";
import AdaugaProdus from "./components/AdaugaProdus.js";
import ProductDetails from "./components/ProductDetails.js";
import Profile from "./pages/Profile.js";
import ProductList from "./components/ProductList.js";
import MessagePage from "./pages/MessagePage.js";
import MyOrders from './components/MyOrders';
import MySales from './components/MySales';

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
      <SocketProvider> {/* ✅ ADĂUGAT - Înfășoară totul în SocketProvider */}
        <Router>
          <Navbar cart={cart} setSearchQuery={setSearchQuery} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products cart={cart} setCart={setCart} searchQuery={searchQuery} />} />
            <Route path="/product/:id" element={<ProductDetails cart={cart} setCart={setCart}/>}/>
            <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/adauga-produs" element={<AdaugaProdus/>}/>
            <Route path="/profile" element={<Profile/>}/>
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/messagepage" element={<MessagePage/>}/>
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/my-sales" element={<MySales />} />
          </Routes>
        </Router>
        
        {/* ✅ ENHANCED - Toast Container cu configurări pentru Socket.io */}
        <ToastContainer 
          position="top-right" 
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          className="toast-container"
          toastClassName="custom-toast"
        />
      </SocketProvider> {/* ✅ ADĂUGAT - Închide SocketProvider */}
    </AuthProvider>
  );
}

export default App;