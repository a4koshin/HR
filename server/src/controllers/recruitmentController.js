import Recruitment from "../models/recruitment.js";
import Employee from "../models/employee.js";
import Applicant from "../models/applicant.js";

// ---------------- Create Recruitment ----------------
export const createRecruitment = async (req, res) => {
  try {
    const { jobTitle, description } = req.body;

    if (!jobTitle || !description) {
      return res
        .status(400)
        .json({ success: false, message: "Job title and description are required" });
    }

    const newJob = await Recruitment.create({ jobTitle, description });
    const populatedJob = await Recruitment.findById(newJob._id)
      .populate("applicants", "name email status")
      .populate("hiredEmployeeId", "fullname email role");

    res.status(201).json({ success: true, job: populatedJob });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- Get All Recruitments ----------------
export const getRecruitments = async (req, res) => {
  try {
    const jobs = await Recruitment.find()
      .populate("applicants", "name email status")
      .populate("hiredEmployeeId", "fullname email role")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- Get Recruitment by ID ----------------
export const getRecruitmentById = async (req, res) => {
  try {
    const job = await Recruitment.findById(req.params.id)
      .populate("applicants", "name email status")
      .populate("hiredEmployeeId", "fullname email role");

    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- Update Recruitment ----------------
export const updateRecruitment = async (req, res) => {
  try {
    const job = await Recruitment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("applicants", "name email status")
      .populate("hiredEmployeeId", "fullname email role");

    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    res.status(200).json({ success: true, job });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ---------------- Delete Recruitment ----------------
export const deleteRecruitment = async (req, res) => {
  try {
    const job = await Recruitment.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    res.status(200).json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- Hire Applicant ----------------
export const hireApplicant = async (req, res) => {
  try {
    const { applicantId } = req.body;

    const job = await Recruitment.findById(req.params.id).populate("applicants");
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const applicant = await Applicant.findById(applicantId);
    if (!applicant) return res.status(404).json({ success: false, message: "Applicant not found" });

    // Create new employee
    const employee = await Employee.create({
      fullname: applicant.name,
      email: applicant.email,
      role: job.jobTitle,
    });

    // Update recruitment
    job.hiredEmployeeId = employee._id;
    job.status = "hired";
    await job.save();

    // Update applicant status
    applicant.status = "hired";
    await applicant.save();

    const populatedJob = await Recruitment.findById(job._id)
      .populate("applicants", "name email status")
      .populate("hiredEmployeeId", "fullname email role");

    res.status(200).json({
      success: true,
      message: "Applicant hired successfully",
      job: populatedJob,
      employee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
