import React, { useState, useEffect, useContext, createContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // store whole user object
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(storedUser);
      setIsAuthenticated(true);

      // Only redirect if you're not already on dashboard
      if (location.pathname === "/login" || location.pathname === "/") {
        navigate("/dashboard");
      }
    }

    setLoadingAuth(false);
  }, []);

  const name =
    user?.name ||
    user?.fullname ||
    (user?.email ? user.email.split("@")[0] : "User");
  const email = user?.email || "";

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        name,
        email,
        isAuthenticated,
        setIsAuthenticated,
        loadingAuth,
        navigate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
