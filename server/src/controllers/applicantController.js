import Applicant from "../models/applicant.js";
import Recruitment from "../models/recruitment.js";
import { applicantSchema } from "../validation/applicantJoi.js";

// ---------------------- Create Applicant ----------------------
export const createApplicant = async (req, res) => {
  try {
    const { error, value } = applicantSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    const { name, email, appliedJob } = value;

    // Check recruitment job exists
    const job = await Recruitment.findById(appliedJob);
    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: "Recruitment job not found" });
    }

    // Prevent duplicate applicant for same job
    const existing = await Applicant.findOne({ email, appliedJob, deleted: 0 });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Applicant already applied for this job",
      });
    }

    const applicant = await Applicant.create({
      name,
      email,
      appliedJob,
    });

    // Add applicant to the job list
    job.applicants.push(applicant._id);
    await job.save();

    res.status(201).json({
      success: true,
      message: "Applicant created successfully",
      applicant,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------- Get All Applicants (Paginated) ----------------------
export const getApplicants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const total = await Applicant.countDocuments({ deleted: 0 });

    const applicants = await Applicant.find({ deleted: 0 })
      .populate("appliedJob", "jobTitle description status")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      applicants,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------- Get Single Applicant ----------------------
export const getApplicantById = async (req, res) => {
  try {
    const applicant = await Applicant.findOne({
      _id: req.params.id,
      deleted: 0,
    }).populate("appliedJob", "jobTitle status");

    if (!applicant) {
      return res
        .status(404)
        .json({ success: false, message: "Applicant not found" });
    }

    res.status(200).json({ success: true, applicant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------- Update Applicant ----------------------
export const updateApplicant = async (req, res) => {
  try {
    // Make all schema fields optional on update
    const updateSchema = applicantSchema.fork(
      Object.keys(applicantSchema.describe().keys),
      (field) => field.optional()
    );

    const { error, value } = updateSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    const applicant = await Applicant.findOne({
      _id: req.params.id,
      deleted: 0,
    });

    if (!applicant) {
      return res
        .status(404)
        .json({ success: false, message: "Applicant not found" });
    }

    // Handle job change logic
    if (
      value.appliedJob &&
      value.appliedJob !== applicant.appliedJob.toString()
    ) {
      const newJob = await Recruitment.findById(value.appliedJob);
      if (!newJob) {
        return res
          .status(404)
          .json({ success: false, message: "Recruitment job not found" });
      }

      // Remove from old job
      await Recruitment.findByIdAndUpdate(applicant.appliedJob, {
        $pull: { applicants: applicant._id },
      });

      // Add to new job
      newJob.applicants.push(applicant._id);
      await newJob.save();
    }

    const updatedApplicant = await Applicant.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Applicant updated successfully",
      applicant: updatedApplicant,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------- Soft Delete Applicant ----------------------
export const deleteApplicant = async (req, res) => {
  try {
    // Corrected soft delete — your old code had a bug
    const applicant = await Applicant.findByIdAndUpdate(
      req.params.id,
      { deleted: 1 },
      { new: true }
    );

    if (!applicant) {
      return res
        .status(404)
        .json({ success: false, message: "Applicant not found" });
    }

    // Remove applicant from Recruitment job list
    await Recruitment.findByIdAndUpdate(applicant.appliedJob, {
      $pull: { applicants: applicant._id },
    });

    res.status(200).json({
      success: true,
      message: "Applicant soft deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
