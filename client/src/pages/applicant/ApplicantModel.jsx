import React, { useState, useEffect } from "react";
import { FiX, FiSave, FiUser, FiMail, FiBriefcase, FiTrendingUp } from "react-icons/fi";
import {
  useCreateFuctionMutation,
  useUpdateFunctionMutation,
} from "../../store/DynamicApi";
import { TailSpin } from "react-loader-spinner";

const ApplicantModel = ({ isOpen, onClose, applicant, onSave, jobs }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    appliedJob: "",
    status: "applied"
  });

  const [createFunction, { isLoading: isCreating }] = useCreateFuctionMutation();
  const [updateFunction, { isLoading: isUpdating }] = useUpdateFunctionMutation();

  const isLoading = isCreating || isUpdating;
  const isEditing = !!applicant;

  const statusOptions = [
    { value: "applied", label: "📥 Applied", color: "text-blue-600" },
    { value: "interview", label: "📅 Interview", color: "text-yellow-600" },
    { value: "hired", label: "✅ Hired", color: "text-green-600" },
    { value: "rejected", label: "❌ Rejected", color: "text-red-600" }
  ];

  useEffect(() => {
    if (applicant) {
      setFormData({
        name: applicant.name || "",
        email: applicant.email || "",
        appliedJob: applicant.appliedJob?._id || applicant.appliedJob || "",
        status: applicant.status || "applied"
      });
    } else {
      setFormData({
        name: "",
        email: "",
        appliedJob: "",
        status: "applied"
      });
    }
  }, [applicant]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateFunction({
          id: applicant._id,
          url: "/applicants",
          formData,
        }).unwrap();
      } else {
        await createFunction({
          url: "/applicants",
          formData,
        }).unwrap();
      }

      onSave();
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save applicant");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <FiUser className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isEditing ? "Edit Applicant" : "Add New Applicant"}
                </h2>
                <p className="text-blue-100 text-sm">
                  {isEditing ? "Update applicant information" : "Add new job applicant to your pipeline"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-xl transition duration-200"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FiUser className="w-4 h-4 text-blue-600" />
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter applicant's full name"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FiMail className="w-4 h-4 text-blue-600" />
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter applicant's email address"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FiBriefcase className="w-4 h-4 text-blue-600" />
                Applied Job *
              </label>
              <select
                name="appliedJob"
                value={formData.appliedJob}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option value="">Select Job Position</option>
                {jobs.map(job => (
                  <option key={job._id} value={job._id}>
                    {job.title || job.jobTitle} - {job.department}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FiTrendingUp className="w-4 h-4 text-blue-600" />
                Application Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value} className={status.color}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Applicant Preview</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900">{formData.name || "Not specified"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-900">{formData.email || "Not specified"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  formData.status === "applied" ? "text-blue-600" :
                  formData.status === "interview" ? "text-yellow-600" :
                  formData.status === "hired" ? "text-green-600" : "text-red-600"
                }`}>
                  {formData.status ? formData.status.charAt(0).toUpperCase() + formData.status.slice(1) : "Not specified"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium disabled:text-gray-400 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name || !formData.email || !formData.appliedJob}
              className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <TailSpin height={20} width={20} color="#FFFFFF" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                <>
                  Update Applicant
                  <FiSave className="w-5 h-5" />
                </>
              ) : (
                <>
                  Create Applicant
                  <FiSave className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicantModel;