import { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Funcție de login (simulăm autentificarea)
  const login = (email, password) => {
    if (email && password) {
      setUser({ email });
      return true;
    }
    return false;
  };

  // Funcție de Sign Up (înregistrează utilizatorul cu mai multe date)
  const signUp = (name, email, phone, city, locality, password) => {
    setUser({ name, email, phone, city, locality });
    return true;
  };

  // Funcție de logout
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
