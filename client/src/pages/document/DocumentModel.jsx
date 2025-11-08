import React, { useState, useEffect } from "react";
import { TailSpin } from "react-loader-spinner";
import {
  useCreateFuctionMutation,
  useUpdateFunctionMutation,
  useGetallFunctionQuery,
} from "../../store/DynamicApi";
import {
  FiX,
  FiFile,
  FiUser,
  FiCalendar,
  FiUpload,
  FiCheckCircle,
  FiFolder,
} from "react-icons/fi";
import { HiDocumentDuplicate } from "react-icons/hi";
import { toast } from "react-toastify";

const DocumentModel = ({ isOpen, onClose, onSave, document }) => {
  const [createDocument, { isLoading: isCreating }] = useCreateFuctionMutation();
  const [updateDocument, { isLoading: isUpdating }] = useUpdateFunctionMutation();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    employeeId: "",
    type: "",
    documentName: "",
    documentFile: "",
    issuedDate: "",
    expiryDate: "",
    complianceCategory: ""
  });

  const [errors, setErrors] = useState({});

  const isLoading = isCreating || isUpdating;
  const isEditing = !!document;

  const { data: employeeData, isLoading: employeesLoading } = useGetallFunctionQuery({ url: "/employees" });

  const documentTypeOptions = [
    { value: "Medical License", label: "Medical License" },
    { value: "Certification", label: "Certification" },
    { value: "Compliance Document", label: "Compliance Document" },
  ];

  useEffect(() => {
    if (document) {
      setFormData({
        employeeId: document.employeeId?._id || document.employeeId || "",
        type: document.type || "",
        documentName: document.documentName || "",
        documentFile: document.documentFile || "",
        issuedDate: document.issuedDate ? document.issuedDate.split("T")[0] : "",
        expiryDate: document.expiryDate ? document.expiryDate.split("T")[0] : "",
        complianceCategory: document.complianceCategory || ""
      });
    } else {
      // Reset form for new document
      setFormData({
        employeeId: "",
        type: "",
        documentName: "",
        documentFile: "",
        issuedDate: "",
        expiryDate: "",
        complianceCategory: ""
      });
    }
    setCurrentStep(1);
    setErrors({});
  }, [document, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simulate file upload - in real app, upload to server and get URL
      const fileUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        documentFile: fileUrl,
        documentName: prev.documentName || file.name
      }));
    }
  };

  const nextStep = () => {
    // Validate step 1 before proceeding
    const step1Errors = {};
    if (!formData.employeeId) step1Errors.employeeId = "Employee is required";
    if (!formData.type) step1Errors.type = "Document type is required";
    if (!formData.documentName) step1Errors.documentName = "Document name is required";
    if (!formData.documentFile) step1Errors.documentFile = "Document file is required";

    if (Object.keys(step1Errors).length > 0) {
      setErrors(step1Errors);
      return;
    }

    setCurrentStep(2);
    setErrors({});
  };

  const prevStep = () => {
    setCurrentStep(1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation
    const finalErrors = {};
    if (!formData.issuedDate) finalErrors.issuedDate = "Issued date is required";

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      return;
    }

    try {
      const payload = {
        employeeId: formData.employeeId,
        type: formData.type,
        documentName: formData.documentName,
        documentFile: formData.documentFile,
        issuedDate: formData.issuedDate,
        expiryDate: formData.expiryDate || null,
        complianceCategory: formData.complianceCategory || null
      };

      console.log("Sending payload:", payload); // Debug log

      if (isEditing) {
        await updateDocument({
          url: `documents/${document._id}`,
          formData: payload,
        }).unwrap();
        toast.success("Document updated successfully!");
      } else {
        await createDocument({
          url: "documents",
          formData: payload,
        }).unwrap();
        toast.success("Document created successfully!");
      }

      onSave();
    } catch (error) {
      console.error("Error saving document:", error);
      const message =
        error?.data?.message ||
        "❌ Something went wrong while saving document.";
      toast.error(message);
    }
  };

  const isBasicInfoValid = () => {
    return (
      formData.employeeId && 
      formData.type && 
      formData.documentName && 
      formData.documentFile
    );
  };

  const isDocumentDetailsValid = () => {
    return formData.issuedDate;
  };

  if (!isOpen) return null;

  const employees = employeeData?.employees || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
        {/* Header */}
        <div className="p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-blue-700">
                {isEditing ? "Edit Document" : "Add New Document"}
              </h2>
              <p className="text-blue-800 mt-1">
                {isEditing
                  ? "Update document information"
                  : "Upload a new document for employee records"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-700 hover:bg-blue-100 hover:text-blue-500 p-2 rounded-xl transition duration-200"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= 1
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 text-gray-400"
                } transition duration-200`}
              >
                <FiFile className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-sm font-medium ${
                    currentStep >= 1 ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  Basic Info
                </span>
                <span className="text-xs text-gray-400">Step 1</span>
              </div>
            </div>

            <div className="flex-1 h-1 bg-gray-200 mx-4">
              <div
                className={`h-full bg-blue-600 transition-all duration-300 ${
                  currentStep >= 2 ? "w-full" : "w-0"
                }`}
              ></div>
            </div>

            <div className="flex items-center space-x-3">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= 2
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 text-gray-400"
                } transition duration-200`}
              >
                <FiCalendar className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-sm font-medium ${
                    currentStep >= 2 ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  Document Details
                </span>
                <span className="text-xs text-gray-400">Step 2</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiUser className="w-4 h-4 text-blue-600" />
                    Employee *
                  </label>
                  <select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
                      errors.employeeId ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                    disabled={employeesLoading}
                  >
                    <option value="">
                      {employeesLoading ? "Loading employees..." : "Select Employee"}
                    </option>
                    {employees.map((employee) => (
                      <option key={employee._id} value={employee._id}>
                        {employee.fullname} - {employee.position}
                      </option>
                    ))}
                  </select>
                  {errors.employeeId && (
                    <p className="text-red-500 text-sm mt-1">{errors.employeeId}</p>
                  )}
                  {/* Debug info */}
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {formData.employeeId || 'None'}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <HiDocumentDuplicate className="w-4 h-4 text-blue-600" />
                    Document Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
                      errors.type ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select Document Type</option>
                    {documentTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiFolder className="w-4 h-4 text-blue-600" />
                    Document Name *
                  </label>
                  <input
                    type="text"
                    name="documentName"
                    value={formData.documentName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
                      errors.documentName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter document name"
                    required
                  />
                  {errors.documentName && (
                    <p className="text-red-500 text-sm mt-1">{errors.documentName}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiUpload className="w-4 h-4 text-blue-600" />
                    Document File *
                  </label>
                  <div className={`border-2 border-dashed rounded-md p-6 text-center transition duration-200 ${
                    errors.documentFile ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-500'
                  }`}>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="hidden"
                      id="documentFile"
                    />
                    <label
                      htmlFor="documentFile"
                      className="cursor-pointer block"
                    >
                      <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {formData.documentFile ? 'Change file' : 'Click to upload document'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, DOC, JPG, PNG (Max 10MB)
                      </p>
                    </label>
                  </div>
                  {formData.documentFile && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                      <FiCheckCircle className="w-4 h-4" />
                      File selected: {formData.documentName}
                    </p>
                  )}
                  {errors.documentFile && (
                    <p className="text-red-500 text-sm mt-1">{errors.documentFile}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isBasicInfoValid()}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-8 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  Continue
                  <FiCheckCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiCalendar className="w-4 h-4 text-blue-600" />
                    Issued Date *
                  </label>
                  <input
                    type="date"
                    name="issuedDate"
                    value={formData.issuedDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
                      errors.issuedDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.issuedDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.issuedDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiCalendar className="w-4 h-4 text-blue-600" />
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    min={formData.issuedDate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiFolder className="w-4 h-4 text-blue-600" />
                    Compliance Category
                  </label>
                  <input
                    type="text"
                    name="complianceCategory"
                    value={formData.complianceCategory}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="e.g., labor law, healthcare regulation"
                  />
                </div>
              </div>

              {/* Document Preview */}
              {formData.documentFile && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FiFile className="w-4 h-4" />
                    Document Preview
                  </h4>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-md border">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <HiDocumentDuplicate className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{formData.documentName}</p>
                      <p className="text-xs text-gray-500">{formData.type}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.open(formData.documentFile, '_blank')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!isDocumentDetailsValid() || isLoading}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-8 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <TailSpin height={20} width={20} color="#FFFFFF" />
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : isEditing ? (
                    <>
                      Update Document
                      <FiCheckCircle className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Create Document
                      <FiCheckCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default DocumentModel;