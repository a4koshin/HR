import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  deleted: {type:Number, enum:[0,1], default:0}
});


const Shift = mongoose.model("Shift", shiftSchema);

export default Shift;
