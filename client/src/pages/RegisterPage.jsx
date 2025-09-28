import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/auth";
import toast, { Toaster } from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword || !role) {
      return toast.error("Please fill all fields");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      await register({ name, email, role, password });
      // toast.success("Signup successful! Please login to continue");
      setTimeout(() => navigate("/login"), 1500);

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An error occurred during sign up. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center gap-6 px-10 py-8 w-full max-w-md mx-auto bg-white border border-gray-200 rounded-md"
      >
        <h1 className="text-3xl font-bold text-blue-600 text-center">
          Create an Account
        </h1>
        <span className="text-gray-500 text-center mb-4">
          Sign up to get started with HR Management
        </span>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-2 bg-gray-100 border border-gray-200 focus:border-blue-500 focus:outline-none rounded-md transition"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 bg-gray-100 border border-gray-200 focus:border-blue-500 focus:outline-none rounded-md transition"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-4 py-2 bg-gray-100 border border-gray-200 focus:border-blue-500 focus:outline-none rounded-md transition"
            required
          >
            <option value="" disabled>
              Select Role
            </option>
            <option value="HR">HR</option>
            <option value="Admin">Admin</option>
          </select>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-2 bg-gray-100 border border-gray-200 focus:border-blue-500 focus:outline-none rounded-md transition w-full pr-10"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="px-4 py-2 bg-gray-100 border border-gray-200 focus:border-blue-500 focus:outline-none rounded-md transition w-full pr-10"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 px-4 py-2 text-white rounded-md w-full hover:bg-blue-700 transition font-semibold mt-2"
        >
          Sign Up
        </button>

        <span className="text-sm text-gray-500 text-center mt-2">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Sign In
          </Link>
        </span>
      </form>
    </div>
  );
};

export default RegisterPage;
