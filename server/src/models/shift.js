import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
});


const Shift = mongoose.model("Shift", shiftSchema);

export default Shift;
