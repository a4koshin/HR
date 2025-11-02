import React from "react";
import { Link, useLocation } from "react-router-dom";
import { navigation } from "../constants/data";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();

  return (
    <div
      className={`bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-md flex-shrink-0">
              <Activity className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  MedCare HRM
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Hospital Management
                </p>
              </div>
            )}
          </div>
          
          {/* Toggle Button */}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex-shrink-0"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1" aria-label="Main navigation">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active indicator */}
              {isActive && !collapsed && (
                <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"></div>
              )}

              <div className="relative">
                <Icon
                  className={`transition-transform duration-200 ${
                    isActive ? "scale-105" : "group-hover:scale-105"
                  } ${collapsed ? "" : "mr-3"}`}
                  size={20}
                />
                
                {/* Active dot for collapsed state */}
                {collapsed && isActive && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                )}
              </div>

              {!collapsed && (
                <span className="font-medium text-sm truncate">{item.name}</span>
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div 
                  className="absolute left-full ml-2 bg-gray-900 dark:bg-gray-700 text-white px-2 py-1.5 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-gray-700"
                  role="tooltip"
                >
                  {item.name}
                  {/* Tooltip arrow */}
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700"></div>
                </div>
              )}

              {/* Badge for notifications */}
              {item.badge && !collapsed && (
                <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer/User area (optional) */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                John Doe
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Administrator
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;