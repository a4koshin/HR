import Recruitment from "../models/recruitment.js";
import Employee from "../models/employee.js";
import Applicant from "../models/applicant.js";
import { recruitmentSchema } from "../validation/recruitmentJoi.js";

// ✅ Create new recruitment
export const createRecruitment = async (req, res) => {
  try {
    const { error, value } = recruitmentSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    const { jobTitle, description } = value;

    const job = await Recruitment.create({ jobTitle, description });

    const populatedJob = await Recruitment.findById(job._id)
      .populate("applicants", "name email status")
      .populate("hiredEmployeeId", "fullname email role");

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      job: populatedJob,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all recruitments
// export const getRecruitments = async (req, res) => {
//   try {
//     const jobs = await Recruitment.find()
//       .populate("applicants", "name email status")
//       .populate("hiredEmployeeId", "fullname email role")
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: jobs.length,
//       jobs,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// ---------------- Get All Recruitments with Pagination ----------------
export const getRecruitments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // default page 1
    const limit = 10;

    const total = await Recruitment.countDocuments();

    const jobs = await Recruitment.find({ deleted: 0 })
      .populate("applicants", "name email status")
      .populate("hiredEmployeeId", "fullname email role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      total, // total job records
      page, // current page
      pages: Math.ceil(total / limit), // total pages
      jobs, // records for this page
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get recruitment by ID
export const getRecruitment = async (req, res) => {
  try {
    const job = await Recruitment.findById(req.params.id)
      .populate("applicants", "name email status")
      .populate("hiredEmployeeId", "fullname email role");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update recruitment
export const updateRecruitment = async (req, res) => {
  try {
    // make all fields optional for update
    const updateSchema = recruitmentSchema.fork(
      Object.keys(recruitmentSchema.describe().keys),
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

    const job = await Recruitment.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    })
      .populate("applicants", "name email status")
      .populate("hiredEmployeeId", "fullname email role");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete recruitment
export const deleteRecruitment = async (req, res) => {
  try {
    const job = await Recruitment.findByIdAndUpdate(
      req.params.id,
      { deleted: 1 },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Hire applicant
export const hireApplicant = async (req, res) => {
  try {
    const { applicantId } = req.body;

    const job = await Recruitment.findById(req.params.id).populate(
      "applicants",
      "name email status"
    );
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const applicant = await Applicant.findById(applicantId);
    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: "Applicant not found",
      });
    }

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
