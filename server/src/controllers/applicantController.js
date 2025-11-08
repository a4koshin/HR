import Applicant from "../models/applicant.js";
import Recruitment from "../models/recruitment.js";
import { applicantSchema } from "../validation/applicantJoi.js";

// CREATE applicant
export const createApplicant = async (req, res) => {
  try {
    const { error, value } = applicantSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    const { name, email, appliedJob } = value;

    const job = await Recruitment.findById(appliedJob);
    if (!job) {
      return res.status(404).json({ success: false, message: "Recruitment job not found" });
    }

    const existingApplicant = await Applicant.findOne({ email, appliedJob });
    if (existingApplicant) {
      return res.status(400).json({ success: false, message: "Applicant already applied for this job" });
    }

    const applicant = await Applicant.create({ name, email, appliedJob });

    job.applicants.push(applicant._id);
    await job.save();

    res.status(201).json({ success: true, message: "Applicant created successfully", applicant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET all applicants
export const getApplicants = async (req, res) => {
  try {
    const applicants = await Applicant.find().populate(
      "appliedJob",
      "jobTitle description status"
    );

    res.status(200).json({ success: true, count: applicants.length, applicants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET single applicant by ID
export const getApplicantById = async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id).populate(
      "appliedJob",
      "jobTitle status"
    );

    if (!applicant) {
      return res.status(404).json({ success: false, message: "Applicant not found" });
    }

    res.status(200).json({ success: true, applicant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE applicant
export const updateApplicant = async (req, res) => {
  try {
    const updateSchema = applicantSchema.fork(
      Object.keys(applicantSchema.describe().keys),
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

    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) {
      return res.status(404).json({ success: false, message: "Applicant not found" });
    }

    // Handle appliedJob change
    if (value.appliedJob && value.appliedJob !== applicant.appliedJob.toString()) {
      const job = await Recruitment.findById(value.appliedJob);
      if (!job) {
        return res.status(404).json({ success: false, message: "Recruitment job not found" });
      }

      await Recruitment.findByIdAndUpdate(applicant.appliedJob, { $pull: { applicants: applicant._id } });
      job.applicants.push(applicant._id);
      await job.save();
    }

    const updatedApplicant = await Applicant.findByIdAndUpdate(req.params.id, value, { new: true, runValidators: true });

    res.status(200).json({ success: true, message: "Applicant updated successfully", applicant: updatedApplicant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE applicant
export const deleteApplicant = async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) {
      return res.status(404).json({ success: false, message: "Applicant not found" });
    }

    await Recruitment.findByIdAndUpdate(applicant.appliedJob, { $pull: { applicants: applicant._id } });
    await applicant.deleteOne();

    res.status(200).json({ success: true, message: "Applicant deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
