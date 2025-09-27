import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },

    assignedEmployees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
  },
  { timestamps: true }
);

const Shift = mongoose.model("Shift", shiftSchema);

export default Shift;
