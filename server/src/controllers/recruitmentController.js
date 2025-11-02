import Recruitment from "../models/recruitment.js";
import Employee from "../models/employee.js";
import Applicant from "../models/applicant.js";

// ✅ Create new recruitment
export const createRecruitment = async (req, res) => {
  try {
    const { jobTitle, description } = req.body;

    if (!jobTitle || !description) {
      return res.status(400).json({ message: "Job title and description are required" });
    }

    const newJob = await Recruitment.create({ jobTitle, description });
    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all recruitments (with applicants and hired employee)
export const getRecruitments = async (req, res) => {
  try {
    const jobs = await Recruitment.find()
      .populate("applicants", "name email status")
      .populate("hiredEmployeeId", "fullname email role");
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get single recruitment by ID
export const getRecruitmentById = async (req, res) => {
  try {
    const job = await Recruitment.findById(req.params.id)
      .populate("applicants", "name email status")
      .populate("hiredEmployeeId", "fullname email role");

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update recruitment
export const updateRecruitment = async (req, res) => {
  try {
    const job = await Recruitment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Delete recruitment
export const deleteRecruitment = async (req, res) => {
  try {
    const job = await Recruitment.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Hire applicant (convert applicant → employee)
export const hireApplicant = async (req, res) => {
  try {
    const { applicantId } = req.body;
    const job = await Recruitment.findById(req.params.id).populate("applicants");

    if (!job) return res.status(404).json({ message: "Job not found" });

    const applicant = await Applicant.findById(applicantId);
    if (!applicant) return res.status(404).json({ message: "Applicant not found" });

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

    res.json({ message: "Applicant hired successfully", employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
