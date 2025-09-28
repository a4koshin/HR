import React, { useState, useEffect, useContext, createContext } from "react";
import { useNavigate } from "react-router-dom";
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const navigate = useNavigate();

  const logOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setName("");
    setEmail("");
    setIsAuthenticated(false);
    navigate("/login");
  };
  return (
    <AuthContext.Provider
      value={{
        name,
        setName,
        email,
        setEmail,
        isAuthenticated,
        setIsAuthenticated,
        logOut,
        loadingAuth,
        setLoadingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// export default AuthProvider;
export { AuthProvider };
