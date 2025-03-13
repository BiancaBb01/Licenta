import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../css/Auth.css";

const AuthModal = ({ isOpen, closeModal }) => {
    const { login, signUp } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [city, setCity] = useState("");
    const [locality, setLocality] = useState("");
    const [error, setError] = useState("");
  
    if (!isOpen) return null;
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (isSignUp) {
        const success = signUp(name, email, phone, city, locality, password);
        if (success) closeModal();
      } else {
        const success = login(email, password);
        if (success) closeModal();
        else setError("Email sau parolă greșită!");
      }
    };
  
    return (
      <div className="auth-overlay" onClick={closeModal}>
        <div className="auth-box" onClick={(e) => e.stopPropagation()}>
          <button className="exit-btn" onClick={closeModal}>✖</button>
  
          <h2>{isSignUp ? "Creează un cont" : "Autentificare"}</h2>
  
          {error && <p className="error-msg">{error}</p>}
  
          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <>
                <input type="text" placeholder="Nume complet" value={name} onChange={(e) => setName(e.target.value)} required />
                <input type="tel" placeholder="Număr de telefon" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                <input type="text" placeholder="Oraș" value={city} onChange={(e) => setCity(e.target.value)} required />
                <input type="text" placeholder="Localitate" value={locality} onChange={(e) => setLocality(e.target.value)} required />
              </>
            )}
  
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Parolă" value={password} onChange={(e) => setPassword(e.target.value)} required />
  
            <button type="submit">{isSignUp ? "Înregistrează-te" : "Autentificare"}</button>
          </form>
  
          <p onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Ai deja un cont? Autentifică-te!" : "Nu ai cont? Creează unul!"}
          </p>
        </div>
      </div>
    );
  };
  
  export default AuthModal;  