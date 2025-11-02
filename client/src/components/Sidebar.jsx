import React from "react";
import { Link, useLocation } from "react-router-dom";
import { navigation } from "../constants/data";
import { Activity, ChevronLeft, Menu, Sparkles, Zap } from "lucide-react";

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();

  return (
    <div
      className={`bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 shadow-2xl border-r border-white/10 backdrop-blur-xl transition-all duration-500 ease-out flex flex-col relative overflow-hidden ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-purple-500/10"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-float"
            style={{
              top: `${20 + i * 15}%`,
              left: `${30 + i * 10}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Animated Logo */}
            <div className="relative">
              <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-2 rounded-2xl shadow-2xl shadow-blue-500/25 relative z-10">
                <Activity className="h-6 w-6 text-white" />
              </div>
              {/* Pulsing Glow Effect */}
              <div className="absolute inset-0 bg-cyan-400 rounded-2xl blur-lg opacity-50 animate-pulse-slow"></div>
            </div>
            
            {!collapsed && (
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                    MedCare
                  </h1>
                  <div className="flex items-center px-2 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-emerald-500/30">
                    <Zap className="h-3 w-3 text-emerald-400 mr-1" />
                    <span className="text-xs font-semibold text-emerald-400">PRO</span>
                  </div>
                </div>
                <p className="text-sm text-cyan-200/70 mt-1">Hospital Management Suite</p>
              </div>
            )}
          </div>

          {/* Toggle Button */}
          <button
            onClick={onToggle}
            className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group backdrop-blur-sm"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <Menu className="h-4 w-4 text-cyan-300 group-hover:scale-110 transition-transform" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-cyan-300 group-hover:scale-110 transition-transform" />
            )}
            {/* Hover Glow */}
            <div className="absolute inset-0 rounded-xl bg-cyan-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 relative p-4 space-y-2">
        {navigation.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              style={{ animationDelay: `${index * 50}ms` }}
              className={`flex items-center px-4 py-3 rounded-2xl transition-all duration-500 group relative overflow-hidden ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-white shadow-2xl shadow-cyan-500/25 border border-cyan-500/30 transform scale-105"
                  : "text-cyan-100/70 hover:text-white hover:bg-white/5 hover:border-white/10 border border-transparent"
              } ${collapsed ? "justify-center" : ""} animate-slide-in`}
            >
              {/* Active Glow Effect */}
              {isActive && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-2xl"></div>
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-blue-500 shadow-lg shadow-cyan-400"></div>
                </>
              )}

              {/* Animated Icon Container */}
              <div className="relative">
                <div className={`p-1.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? "bg-cyan-500/20" 
                    : "bg-white/5 group-hover:bg-cyan-500/20"
                }`}>
                  <Icon
                    className={`transition-all duration-300 ${
                      isActive 
                        ? "text-cyan-300 scale-110" 
                        : "text-cyan-200/70 group-hover:text-cyan-300 group-hover:scale-110"
                    }`}
                    size={20}
                  />
                </div>
                
                {/* Icon Glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-cyan-400 rounded-xl blur-md opacity-50"></div>
                )}
              </div>

              {/* Text */}
              {!collapsed && (
                <div className="ml-3 flex-1">
                  <span className="font-semibold text-sm block">{item.name}</span>
                  {item.description && (
                    <span className="text-xs text-cyan-200/50 mt-0.5 block">
                      {item.description}
                    </span>
                  )}
                </div>
              )}

              {/* Notification Badge */}
              {item.badge && !collapsed && (
                <span className="ml-auto bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs px-2 py-1 rounded-full min-w-[24px] text-center shadow-lg shadow-red-500/25">
                  {item.badge}
                </span>
              )}

              {/* Mini Badge for Collapsed */}
              {item.badge && collapsed && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900 shadow-lg"></div>
              )}

              {/* Hover Arrow */}
              {!collapsed && (
                <div className={`ml-auto transform transition-all duration-300 ${
                  isActive ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                }`}>
                  <div className="w-2 h-2 border-r-2 border-t-2 border-cyan-300 rotate-45"></div>
                </div>
              )}

              {/* Enhanced Tooltip for Collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3 bg-slate-800/95 backdrop-blur-xl text-white px-3 py-2 rounded-xl text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-2xl border border-white/10">
                  <div className="font-semibold">{item.name}</div>
                  {item.description && (
                    <div className="text-cyan-200/70 text-xs mt-1">{item.description}</div>
                  )}
                  {/* Tooltip Arrow */}
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-8 border-transparent border-r-slate-800/95"></div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="relative p-4 border-t border-white/10">
        {!collapsed ? (
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl p-4 border border-cyan-500/20 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="bg-cyan-500/20 p-2 rounded-xl">
                <Sparkles className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Pro Features</p>
                <p className="text-xs text-cyan-200/70 mt-1">Upgrade for advanced analytics</p>
              </div>
            </div>
            <button className="w-full mt-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/25">
              Upgrade Now
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="bg-cyan-500/20 p-3 rounded-xl border border-cyan-500/30">
              <Sparkles className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;