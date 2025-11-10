import Document from "../models/document.js";
import { documentSchema } from "../validation/documentJoi.js";

// CREATE document

export const createDocument = async (req, res) => {
    try {
      const { error, value } = documentSchema.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.details.map((err) => err.message),
        });
      }
  
      const document = await Document.create({
        employeeId: value.employeeId,
        type: value.type,
        documentName: value.documentName,
        documentFile: value.documentFile,
        issuedDate: value.issuedDate,
        expiryDate: value.expiryDate || null,
        complianceCategory: value.complianceCategory || null,
      });
  
      // ✅ FIX: Populate the employee data
      const populatedDocument = await Document.findById(document._id)
        .populate("employeeId", "fullname email");
  
      res.status(201).json({
        success: true,
        message: "Document created successfully",
        document: populatedDocument, // ✅ Return populated document
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
// GET all documents
// ---------------- Get All Documents with Pagination ----------------
export const getDocuments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // default page 1
    const limit = 10;

    const total = await Document.countDocuments();

    const documents = await Document.find()
      .populate("employeeId", "fullname email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      total,                // total documents
      page,                 // current page
      pages: Math.ceil(total / limit), // total pages
      documents,            // records for this page
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// GET single document by ID
export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate("employeeId", "fullname email");
    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }
    res.status(200).json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE document
export const updateDocument = async (req, res) => {
  try {
    const updateSchema = documentSchema.fork(
      Object.keys(documentSchema.describe().keys),
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

    const document = await Document.findByIdAndUpdate(req.params.id, value, { new: true, runValidators: true });

    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    res.status(200).json({
      success: true,
      message: "Document updated successfully",
      document,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE document
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    await document.deleteOne();

    res.status(200).json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
