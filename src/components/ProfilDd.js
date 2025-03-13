/*Profil drop down*/
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../css/ProfilDd.css";

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) return null; // Dacă nu e logat, nu afișăm nimic

  return (
    <div className="profile-container">
      <img src="/images/profile-icon.png" alt="Profil" className="profile-icon" onClick={() => setIsOpen(!isOpen)} />

      {isOpen && (
        <div className="profile-dropdown">
          <p><strong>{user.name}</strong></p>
          <p>{user.email}</p>
          <p>{user.city}, {user.locality}</p>
          <button onClick={() => navigate("/profil")}>Vezi Profil</button>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
