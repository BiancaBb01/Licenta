import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import AuthModal from "../pages/Auth";
import { useAuth } from "../context/AuthContext";
import ProfileDropdown from "./ProfilDd";
import CartIcon from "./CartIcon";
import "../css/navbar.css";
import logo from "../images/logo.jpg";
import AdaugaProdus from "../components/AdaugaProdus.js";

const Navbar = ({ cart, setSearchQuery }) => {
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const cartItemCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-image" />
        </div>

        {/* Meniu principal */}
        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/products" onClick={() => setMenuOpen(false)}>Produse</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          <Link to="/messagepage" onClick={() => setMenuOpen(false)}>Message</Link>
          <Link to="/my-orders">Comenzile mele</Link>
          <Link to="/my-sales">Vânzările mele</Link>
          <SearchBar setQuery={setSearchQuery} />

        </div>

        {/* Dreapta: autentificare și coș */}
        <div className="navbar-right">
          {user ? (
            <ProfileDropdown />
          ) : (
            <button className="login-button" onClick={() => setIsAuthOpen(true)}>
              Login
            </button>
          )}

          <Link to="/cart">
            <CartIcon cartCount={cartItemCount} />
          </Link>

          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} closeModal={() => setIsAuthOpen(false)} />
    </nav>
  );
};

export default Navbar;
