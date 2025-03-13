import { useAuth } from "../context/AuthContext";
import "../css/AuthButtons.css";

const AuthButtons = () => {
  const { user, login, logout } = useAuth();

  return user (
    <div className="profile">
      <span>Bun venit, {user.name}!</span>
      <button onClick={logout}>Logout</button>
    </div>
  )
};

export default AuthButtons;