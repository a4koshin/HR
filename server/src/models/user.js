import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["Admin", "HR"], required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const userModal = mongoose.model("User", userSchema);

export default userModal;
