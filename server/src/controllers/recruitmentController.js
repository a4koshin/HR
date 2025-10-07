// controllers/recruitmentController.js
import Recruitment from "../models/recruitment.js";
import Employee from "../models/employee.js";

// Create a recruitment/job
export const createRecruitment = async (req, res) => {
  try {
    const job = await Recruitment.create(req.body);
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all recruitments
export const getRecruitments = async (req, res) => {
  try {
    const jobs = await Recruitment.find().populate("hiredEmployeeId");
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single recruitment
export const getRecruitmentById = async (req, res) => {
  try {
    const job = await Recruitment.findById(req.params.id).populate("hiredEmployeeId");
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update recruitment
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

// Delete recruitment
export const deleteRecruitment = async (req, res) => {
  try {
    const job = await Recruitment.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Hire an applicant (creates Employee & links to recruitment)
export const hireApplicant = async (req, res) => {
  try {
    const { applicantEmail } = req.body;
    const job = await Recruitment.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const applicant = job.applicants.find(a => a.email === applicantEmail);
    if (!applicant) return res.status(404).json({ message: "Applicant not found" });

    // Create Employee
    const employee = await Employee.create({
      fullname: applicant.name,
      email: applicant.email,
      role: job.jobTitle,
    });

    // Update applicant status and link Employee
    applicant.status = "hired";
    job.hiredEmployeeId = employee._id;
    await job.save();

    res.json({ message: "Applicant hired successfully", employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
