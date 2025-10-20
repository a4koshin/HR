import React, { useState, useEffect } from "react";
import { FiX, FiSave, FiBriefcase, FiFileText, FiTrendingUp } from "react-icons/fi";
import {
  useCreateFuctionMutation,
  useUpdateFunctionMutation,
} from "../../store/DynamicApi";
import { TailSpin } from "react-loader-spinner";

const RecruitmentModel = ({ isOpen, onClose, recruitment, onSave }) => {
  const [formData, setFormData] = useState({
    jobTitle: "",
    description: "",
    status: "open"
  });

  const [createFunction, { isLoading: isCreating }] = useCreateFuctionMutation();
  const [updateFunction, { isLoading: isUpdating }] = useUpdateFunctionMutation();

  const isLoading = isCreating || isUpdating;
  const isEditing = !!recruitment;

  const statusOptions = [
    { value: "open", label: "🟢 Open", color: "text-green-600" },
    { value: "closed", label: "🔴 Closed", color: "text-red-600" },
    { value: "hired", label: "✅ Hired", color: "text-blue-600" }
  ];

  useEffect(() => {
    if (recruitment) {
      setFormData({
        jobTitle: recruitment.jobTitle || "",
        description: recruitment.description || "",
        status: recruitment.status || "open"
      });
    } else {
      setFormData({
        jobTitle: "",
        description: "",
        status: "open"
      });
    }
  }, [recruitment]);

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
          id: recruitment._id,
          url: "/recruitment",
          formData,
        }).unwrap();
      } else {
        await createFunction({
          url: "/recruitment",
          formData,
        }).unwrap();
      }

      onSave();
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save job position");
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
                <FiBriefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isEditing ? "Edit Job Position" : "Create New Job Position"}
                </h2>
                <p className="text-blue-100 text-sm">
                  {isEditing ? "Update job position details" : "Add new job opening to attract talented candidates"}
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
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FiBriefcase className="w-4 h-4 text-blue-600" />
                Job Title *
              </label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="e.g., Senior Software Engineer, Marketing Manager"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FiFileText className="w-4 h-4 text-blue-600" />
                Job Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none"
                placeholder="Describe the role, responsibilities, requirements, and what you're looking for in a candidate..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FiTrendingUp className="w-4 h-4 text-blue-600" />
                Job Status
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
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Preview</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Position:</span>
                <span className="font-medium text-gray-900">{formData.jobTitle || "Not specified"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  formData.status === "open" ? "text-green-600" :
                  formData.status === "closed" ? "text-red-600" : "text-blue-600"
                }`}>
                  {formData.status ? formData.status.charAt(0).toUpperCase() + formData.status.slice(1) : "Not specified"}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-gray-600 block mb-1">Description Preview:</span>
                <p className="text-gray-700 text-sm line-clamp-3">
                  {formData.description || "No description provided"}
                </p>
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
              disabled={isLoading || !formData.jobTitle || !formData.description}
              className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <TailSpin height={20} width={20} color="#FFFFFF" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                <>
                  Update Job
                  <FiSave className="w-5 h-5" />
                </>
              ) : (
                <>
                  Create Job
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

export default RecruitmentModel;