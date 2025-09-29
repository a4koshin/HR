import React from "react";
import { Link, useLocation } from "react-router-dom";
import { navigation } from "../constants/data";
import { Activity } from "lucide-react";

const Sidebar = ({ collapsed }) => {
  const location = useLocation();

  return (
    <div
      className={`bg-white shadow-lg transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-800">MedCare HRM</h1>
              <p className="text-sm text-gray-500">Hospital Management</p>
            </div>
          )}
        </div>
      </div>

      <nav className="mt-6">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              } ${collapsed ? "relative" : ""}`}
            >
              <Icon className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`} />
              {!collapsed && <span className="font-medium">{item.name}</span>}
              {collapsed && (
                <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
