import mongoose from "mongoose";

const trainingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    trainer: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }
    ],
    completionStatus: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started",
    },
    deleted: {type:Number, enum:[0,1], default:0}

  },
  { timestamps: true }
);




const Training =  mongoose.model("Training", trainingSchema);

export default Training;

