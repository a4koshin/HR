import React from "react";
import { Link, useLocation } from "react-router-dom";
import { navigation } from "../constants/data";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();

  return (
    <div
      className={`bg-gray-200 shadow-2xl text-transition-all duration-300 flex flex-col ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">MedCare HRM</h1>
              <p className="text-sm text-gray-300">Hospital Management</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 px-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg transform scale-105"
                  : "text-blue-500 hover:bg-gray-750 hover:text-white hover:translate-x-1"
              } ${collapsed ? "justify-center" : ""}`}
            >
              {/* Active indicator */}
              {isActive && !collapsed && (
                <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full"></div>
              )}

              <Icon
                className={`transition-transform duration-200 ${
                  isActive ? "scale-110" : ""
                } ${collapsed ? "" : "mr-3"}`}
                size={20}
              />

              {!collapsed && <span className="font-medium">{item.name}</span>}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-600">
                  {item.name}
                  {/* Tooltip arrow */}
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-8 border-transparent border-r-gray-800"></div>
                </div>
              )}

              {/* Hover effect dot  */}
              {!collapsed && (
                <div
                  className={`absolute right-4 w-2 h-2 rounded-full bg-white  opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                    isActive ? "opacity-100" : ""
                  }`}
                ></div>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
export default Sidebar;
