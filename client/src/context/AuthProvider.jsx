import React, { useState, useEffect, useContext, createContext } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true); // start loading
  const navigate = useNavigate();

  // Restore auth on page load
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (user && token) {
      setName(user.fullname || user.name);
      setEmail(user.email);
      setRole(user.role);
      setIsAuthenticated(true);
    }
    setLoadingAuth(false); // done checking
  }, []);

  return (
    <AuthContext.Provider
      value={{
        name,
        setName,
        email,
        setEmail,
        role,
        setRole,
        isAuthenticated,
        setIsAuthenticated,

        navigate,
        loadingAuth,
        setLoadingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
