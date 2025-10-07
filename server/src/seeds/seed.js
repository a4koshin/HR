import userModel from "../models/user.js";
import bcrypt from "bcrypt";

export const seedAdmin = async () => {
  try {
    const adminExists = await userModel.findOne({ role: "Admin" });
    if (!adminExists) {
      const hashPass = await bcrypt.hash("Admin123", 10);
      await userModel.create({
        name: "Admin",
        email: "mankajr11@gmail.com",
        password: hashPass,
        role: "Admin",
      });
      console.log("Admin user created");
    }
  } catch (err) {
    console.error("Error seeding admin:", err);
  }
};
