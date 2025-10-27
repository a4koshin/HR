import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff, FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";
import { useLoginProviderMutation } from "../store/auth/authApi";
import { useAuth } from "../context/AuthProvider";
import { TailSpin } from "react-loader-spinner";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setIsAuthenticated, setName, setEmail: setAuthEmail } = useAuth();

  const [loginProvider, { data, isError, error, isLoading }] =
    useLoginProviderMutation();

  // Handle login success
  useEffect(() => {
    if (data?.token) {
      // Save user and token in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          token: data.token,
          id: data.user.id,
          fullname: data.user.fullname,
          email: data.user.email,
        })
      );
      localStorage.setItem("token", data.token);

      // Update AuthContext
      setIsAuthenticated(true);
      setName(data.user.fullname);
      setAuthEmail(data.user.email);

      toast.success("Logged in successfully!");
      navigate("/dashboard"); // navigate without reload
    }
  }, [data]);

  // Handle login errors
  useEffect(() => {
    if (isError) {
      let message = "Something went wrong";
      if (error?.data?.message) message = error.data.message;
      else if (error?.error) message = error.error; // network errors
      toast.error(message);
    }
  }, [isError, error]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginProvider({ email, password }).unwrap();
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left Side - Illustration/Info */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-8 lg:p-12 text-white hidden lg:flex flex-col justify-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4">Welcome Back</h2>
            <p className="text-blue-100 text-lg leading-relaxed">
              Access your HR dashboard to manage employees, track performance,
              and streamline your hospital's workforce operations.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <FiArrowRight className="w-4 h-4" />
              </div>
              <span className="text-blue-100">Manage employee data</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <FiArrowRight className="w-4 h-4" />
              </div>
              <span className="text-blue-100">Track performance metrics</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <FiArrowRight className="w-4 h-4" />
              </div>
              <span className="text-blue-100">Streamline HR processes</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="text-center lg:text-left mb-8">
            <div className="lg:hidden w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HR Login
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Sign in to your HR account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FiMail className="w-4 h-4 text-blue-600" />
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FiLock className="w-4 h-4 text-blue-600" />
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center rounded-md text-gray-400 hover:text-blue-600 transition duration-200"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition duration-200"
              >
                Forgot password?
              </a>
            </div>

            {/* Error Message */}
            {isError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <div className="w-2 h-8 bg-red-500 rounded-full"></div>
                <div>
                  <p className="text-red-700 font-medium text-sm">
                    {error?.data?.message ||
                      error?.error ||
                      "Something went wrong"}
                  </p>
                </div>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-400 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-lg flex items-center justify-center gap-3 ${
                isLoading ? "cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <TailSpin height={20} width={20} color="#FFFFFF" />
                </>
              ) : (
                <>
                  Sign In
                  <FiArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Additional Links */}
            <div className="text-center pt-4">
              <p className="text-gray-600 text-sm">
                Need help?{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 font-medium transition duration-200"
                >
                  Contact support
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
