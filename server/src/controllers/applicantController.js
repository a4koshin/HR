import Applicant from "../models/applicant.js";
import Recruitment from "../models/recruitment.js";

// Create a new applicant and link to a recruitment job
export const createApplicant = async (req, res) => {
  try {
    const { name, email, appliedJob } = req.body;

    // Check if the recruitment job exists
    const job = await Recruitment.findById(appliedJob);
    if (!job) {
      return res.status(404).json({ message: "Recruitment job not found" });
    }

    // Prevent duplicate applications
    const existingApplicant = await Applicant.findOne({ email, appliedJob });
    if (existingApplicant) {
      return res.status(400).json({ message: "Applicant already applied for this job" });
    }

    const applicant = await Applicant.create({ name, email, appliedJob });

    // Link applicant to the recruitment job
    job.applicants.push(applicant._id);
    await job.save();

    res.status(201).json(applicant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all applicants
export const getApplicants = async (req, res) => {
  try {
    const applicants = await Applicant.find().populate(
      "appliedJob",
      "jobTitle description status"
    );
    res.status(200).json(applicants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single applicant by ID
export const getApplicantById = async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id).populate(
      "appliedJob",
      "jobTitle status"
    );
    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }
    res.status(200).json(applicant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update applicant information
export const updateApplicant = async (req, res) => {
  try {
    const updatedApplicant = await Applicant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedApplicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    res.status(200).json(updatedApplicant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an applicant and unlink from recruitment job
export const deleteApplicant = async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    await Recruitment.findByIdAndUpdate(applicant.appliedJob, {
      $pull: { applicants: applicant._id },
    });

    await applicant.deleteOne();
    res.status(200).json({ message: "Applicant deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
