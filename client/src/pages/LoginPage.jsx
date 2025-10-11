import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../context/AuthProvider";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [loginProvider, { data, isError, error, isLoading }] =
    useLoginProviderMutation();
  useEffect(() => {
    if (data?.token) {
      localStorage.setItem(
        "user",
        JSON.stringify({
          token: data.token,
          id: data.user.id,
        })
      );
      navigate("/");
      window.location.reload();
    }
  }, [data]);

  useEffect(() => {
    const showAlert = (message, icon = "error") => {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon,
        title: message,
        showConfirmButton: false,
        timer: 3000,
        padding: "10px 20px",
      });
    };

    if (isError) showAlert(error?.data?.msg);

    if (data) showAlert(data?.msg, "success");
  }, [isError, error, data]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginProvider({ username: email, password }).unwrap();
    } catch (error) {
      console.error("Login failed:", error);
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
          disabled={loading}
          className={`bg-blue-600 px-4 py-2 text-white rounded-md w-full font-semibold mt-4 transition ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
