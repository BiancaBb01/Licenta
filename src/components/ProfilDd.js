/*Profil drop down*/
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {FaUser} from 'react-icons/fa';
import "../css/ProfilDd.css";

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) return null; // Dacă nu e logat, nu afișăm nimic

  return (
    <div className="profile-container">
      <FaUser onClick={() => setIsOpen(!isOpen)} />

      {isOpen && (
        <div className="profile-dropdown">
          <p><strong>{user.name}</strong></p>
          <button onClick={() => navigate("/profile")}>Profil</button>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
