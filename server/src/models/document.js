import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee', // Links to your Employee model
    required: true,
  },
  type: {
    type: String,
    enum: ['Medical License', 'Certification', 'Compliance Document'],
    required: true,
  },
  documentName: {
    type: String,
    required: true,
  },
  documentFile: {
    type: String, // Store file URL or path
    required: true,
  },
  issuedDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: false,
  },
  complianceCategory: {
    type: String, // e.g., labor law, healthcare regulation
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deleted: {type:Number, enum:[0,1], default:0}
});

const Document = mongoose.model('Document', documentSchema);

export default Document;
