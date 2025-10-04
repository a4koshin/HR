import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

const Layout = ({ children }) => {
  const { setName, setEmail, setRole, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false); // state for sidebar

  const logOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setName("");
    setEmail("");
    setRole("");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onToggleSidebar={() => setCollapsed(!collapsed)} // toggle collapse
          onLogout={logOut}
        />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
