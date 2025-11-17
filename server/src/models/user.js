import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 3, maxlength: 50 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    deleted: { type: Number, enum: [0, 1], default: 0 },

    isSuperAdmin: { type: Boolean, default: false },

    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", default: null },

    // final assigned permissions (pages)
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);
export default userModel;
