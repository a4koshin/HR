import axiosInstance from "./axiosInstance";
import toast from "react-hot-toast";

export const login = async (email, password) => {
  try {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });

    const { user, token } = response.data;

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);

    toast.success("Login successful");
    return response.data;
  } catch (err) {
    console.error("Login failed:", err);
    toast.error("Login failed. Please check your credentials.");
    throw err;
  }
};

export const register = async ({ name, email, role, password }) => {
  try {
    const response = await axiosInstance.post("/auth/register", {
      name,
      email,
      role,
      password,
    });

    toast.success("Signup successful");
    // console.log(response.data);
    return response.data;
  } catch (err) {
    console.error("Signup failed:", err);
    toast.error("Signup failed. Please try again.");
    throw err;
  }
};
