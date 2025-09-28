import Training from "../models/training.js";
import Employee from "../models/employee.js";

// ---------------- Create Training ----------------
export const createTraining = async (req, res) => {
  try {
    const { title, description, trainer, startDate, endDate, participants, completionStatus } = req.body;

    // Required fields check
    if (!title || !trainer || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Title, trainer, startDate, and endDate are required",
      });
    }

    // Check participants validity (if provided)
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

    res.status(201).json({ success: true, training });
  } catch (error) {
    console.error("Error in createTraining:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------- Get All Trainings ----------------
export const getTrainings = async (req, res) => {
  try {
    const trainings = await Training.find()
      .populate("participants", "fullname email role")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: trainings.length, trainings });
  } catch (error) {
    console.error("Error in getTrainings:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- Get Single Training ----------------
export const getTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id).populate(
      "participants",
      "fullname email role"
    );

    if (!training) {
      return res.status(404).json({ success: false, message: "Training not found" });
    }

    res.status(200).json({ success: true, training });
  } catch (error) {
    console.error("Error in getTraining:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- Update Training ----------------
export const updateTraining = async (req, res) => {
  try {
    const updates = req.body;

    // Validate participants if updating them
    if (updates.participants && updates.participants.length > 0) {
      const validEmployees = await Employee.find({ _id: { $in: updates.participants } });
      if (validEmployees.length !== updates.participants.length) {
        return res.status(400).json({
          success: false,
          message: "One or more participants are invalid employees",
        });
      }
    }

    const training = await Training.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate("participants", "fullname email role");

    if (!training) {
      return res.status(404).json({ success: false, message: "Training not found" });
    }

    res.status(200).json({ success: true, training });
  } catch (error) {
    console.error("Error in updateTraining:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- Delete Training ----------------
export const deleteTraining = async (req, res) => {
  try {
    const training = await Training.findByIdAndDelete(req.params.id);

    if (!training) {
      return res.status(404).json({ success: false, message: "Training not found" });
    }

    res.status(200).json({ success: true, message: "Training deleted successfully" });
  } catch (error) {
    console.error("Error in deleteTraining:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
