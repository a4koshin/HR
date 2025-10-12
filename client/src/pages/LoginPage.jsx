import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
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
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="flex flex-col justify-center gap-6 px-10 py-8 w-full max-w-md mx-auto bg-white border border-gray-200 rounded-md"
      >
        <Link to="/" className="text-blue-600 hover:underline mb-2">
          &larr;
        </Link>
        <h1 className="text-3xl font-bold text-blue-600 mb-2 text-center">
          HR Login
        </h1>
        <span className="text-gray-500 text-center mb-4">
          Login to access your HR account
        </span>

        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 bg-gray-100 border border-gray-200 focus:border-blue-500 focus:outline-none rounded-md transition"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-2 bg-gray-100 border border-gray-200 focus:border-blue-500 focus:outline-none rounded-md transition w-full pr-10"
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEye /> : <FiEyeOff />}
            </button>
          </div>
        </div>

        {isError && (
          <p className="bg-red-200 px-2 py-2 rounded-md text-red-500 text-sm text-center">
            {error?.data?.message || error?.error || "Something went wrong"}
          </p>
        )}

        <div className="flex justify-between items-center mt-2">
          <a href="#" className="text-sm text-blue-600 hover:underline">
            Forgot password?
          </a>
          <Link
            to="/register"
            className="text-sm text-blue-600 hover:underline"
          >
            Sign Up
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`flex items-center justify-center bg-blue-600 px-4 py-2 text-white rounded-md w-full font-semibold mt-4 transition ${
            isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {isLoading ? (
            <TailSpin height={20} width={20} color="#FFFFFF" />
          ) : (
            "Login"
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
