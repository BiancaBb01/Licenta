import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../css/AuthButtons.css";

const AuthButtons = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="profile">
      
    </div>
  );
};

export default AuthButtons;