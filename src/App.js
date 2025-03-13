import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useState } from "react";
import Navbar from "./components/navbar.js";
import Home from "./pages/Home";
import Products from "./pages/Produse.js"; 
import Cart from "./pages/Cart";
import Contact from "./pages/Contact.js";

function App() {
  const [cart, setCart] = useState([]);

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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
