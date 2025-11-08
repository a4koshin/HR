import Training from "../models/training.js";
import Employee from "../models/employee.js";
import { trainingSchema } from "../validation/trainingJoi.js";

// CREATE training
export const createTraining = async (req, res) => {
  try {
    const { error, value } = trainingSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    const { title, description, trainer, startDate, endDate, participants, completionStatus } = value;

    // Validate participants
    if (participants && participants.length > 0) {
      const validEmployees = await Employee.find({ _id: { $in: participants } });
      if (validEmployees.length !== participants.length) {
        return res.status(400).json({
          success: false,
          message: "One or more participants are invalid employees",
        });
      }
    }

    const training = await Training.create({
      title,
      description,
      trainer,
      startDate,
      endDate,
      participants,
      completionStatus,
    });

    res.status(201).json({
      success: true,
      message: "Training created successfully",
      training,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET all trainings
export const getTrainings = async (req, res) => {
  try {
    const trainings = await Training.find()
      .populate("participants", "fullname email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: trainings.length,
      trainings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET single training
export const getTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id)
      .populate("participants", "fullname email role");

    if (!training) {
      return res.status(404).json({ success: false, message: "Training not found" });
    }

    res.status(200).json({ success: true, training });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE training
export const updateTraining = async (req, res) => {
  try {
    const updateSchema = trainingSchema.fork(
      Object.keys(trainingSchema.describe().keys),
      (field) => field.optional()
    );

    const { error, value } = updateSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    // Validate participants if updating them
    if (value.participants && value.participants.length > 0) {
      const validEmployees = await Employee.find({ _id: { $in: value.participants } });
      if (validEmployees.length !== value.participants.length) {
        return res.status(400).json({
          success: false,
          message: "One or more participants are invalid employees",
        });
      }
    }

    const training = await Training.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    }).populate("participants", "fullname email role");

    if (!training) {
      return res.status(404).json({ success: false, message: "Training not found" });
    }

    res.status(200).json({ success: true, message: "Training updated successfully", training });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE training
export const deleteTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, message: "Training not found" });
    }

    await training.deleteOne();
    res.status(200).json({ success: true, message: "Training deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
