import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <>
      <header className="flex justify-around items-center px-8 py-4 shadow">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-semibold text-blue-700">
            HR Management
          </span>
        </div>
        <button
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded-lg shadow focus:outline-none focus:ring-4 focus:ring-indigo-400"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </header>
      <main className="flex flex-col justify-center items-center text-center min-h-[80vh]">
        <div className="font-bold text-4xl md:text-5xl lg:text-6xl mb-6">
          <span className="block mb-2">Welcome to</span>
          <span className="text-blue-600">Human Resource Management</span>
          <span className="block mt-2 text-2xl font-normal text-gray-600">
            Web Application
          </span>
        </div>
        <p className="text-lg text-gray-500 max-w-xl mb-8">
          Streamline HR processes, empower your workforce, and manage employee
          data efficiently. Enhance productivity and compliance with our
          comprehensive Human Resource Management platform.
        </p>
        <button
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded-lg shadow-lg text-lg font-medium focus:outline-none focus:ring-4 focus:ring-blue-400"
          onClick={() => navigate("/register")}
        >
          Get Started
        </button>
      </main>
    </>
  );
};

export default HomePage;
