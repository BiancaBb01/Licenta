import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // La încărcarea aplicației, verificăm dacă există un token salvat
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        
        if (token && storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          // Configurăm axios pentru a include token-ul în toate request-urile viitoare
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          
          // Opțional: Poți verifica validitatea token-ului făcând un request către server
          // Acest pas este util pentru a verifica dacă token-ul nu a expirat
          // try {
          //   await axios.get(`/api/users/${userData.id}`);
          // } catch (err) {
          //   // Dacă token-ul nu mai este valid, deconectăm utilizatorul
          //   if (err.response?.status === 401) {
          //     logout();
          //   }
          // }
        }
      } catch (err) {
        console.error("Eroare la verificarea autentificării:", err);
        logout(); // În caz de eroare, deconectăm utilizatorul
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Funcție de login
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post("/api/auth/login", { email, password });
      
      const { token, user } = response.data;
      
      // Salvăm token-ul și utilizatorul în localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      // Setăm header-ul pentru toate requesturile viitoare
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      setUser(user);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Eroare la autentificare";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Funcție de Sign Up
  const signUp = async (name, email, phone, city, locality, password) => {
    try {
      setError(null);
      const response = await axios.post("/api/auth/register", {
        name,
        email,
        password,
        phone,
        city,
        locality
      });
      
      // După înregistrare, facem login automat
      return await login(email, password);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Eroare la înregistrare";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Funcție de logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    setError(null); // Resetăm și orice eroare la deconectare
  };

  // Funcție pentru actualizarea datelor utilizatorului în context
  const updateUser = (updatedUserData) => {
    setUser(prevUser => {
      if (!prevUser) return updatedUserData;
      
      const newUser = { ...prevUser, ...updatedUserData };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  // Funcție pentru resetarea erorilor
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signUp, 
      logout, 
      loading, 
      error, 
      updateUser, 
      clearError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);