import React from "react";
import { Menu, Bell, User, Search, LogOut, Settings, User as UserIcon, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthProvider"; 

const Header = ({ onToggleSidebar, onLogout }) => {
    const { name, email } = useAuth();
    
    // Get user initials for avatar
    const getUserInitials = (name) => {
      if (!name || typeof name !== "string") return "";
    
      return name
        .trim()                // remove extra spaces
        .split(/\s+/)          // split by one or more spaces
        .map(word => word[0].toUpperCase()) // take first letter of each word
        .join('')              // join letters together
        .slice(0, 2);          // limit to first 2 letters
    };
    
    return (
        <header className="bg-white shadow-lg border-b border-gray-100">
            <div className="flex items-center justify-between px-6 py-3">
                {/* Left Section */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onToggleSidebar}
                        className="p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                    >
                        <Menu className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                    </button>

                    {/* Search Bar */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search employees, departments..."
                            className="pl-10 pr-4 py-2.5 w-80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-all duration-200"
                        />
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-4">

                    {/* User Profile Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 group">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-900">
                                    {name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {email}
                                </p>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                                <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                                    <span className="text-white font-semibold text-sm">
                                        {getUserInitials(email)}
                                    </span>
                                </div>
                                <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-right">
                            {/* User Info Section */}
                            <div className="p-4 border-b border-gray-100">
                                <div className="flex items-center space-x-3">
                                    <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                                        <span className="text-white font-semibold text-sm">
                                            {getUserInitials(email)}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {name}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="p-2">
                                <a
                                    href="#"
                                    className="flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 group"
                                >
                                    <UserIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                                    <span>My Profile</span>
                                </a>
                                <a
                                    href="#"
                                    className="flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 group"
                                >
                                    <Settings className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                                    <span>Account Settings</span>
                                </a>
                            </div>

                            {/* Logout Section */}
                            <div className="p-2 border-t border-gray-100">
                                <button
                                    onClick={onLogout}
                                    className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Sign Out</span>
                                </button>
                            </div>

                            {/* Dropdown Arrow */}
                            <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="bg-gray-50 border-t border-gray-100 px-6 py-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center space-x-6">
                        <span className="font-medium">Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                        <span className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>System: Operational</span>
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span>Last sync: Just now</span>
                        <span className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span>Live</span>
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;