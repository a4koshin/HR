import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Admin", "User"], default: "User" },
  permissions: { type: [String], default: [] }
}, { timestamps: true });



const userModel = mongoose.model("User", userSchema);

export default userModel