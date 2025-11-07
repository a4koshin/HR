import React, { useState, useEffect } from "react";
import { TailSpin } from "react-loader-spinner";
import {
  useCreateFuctionMutation,
  useUpdateFunctionMutation,
} from "../../store/DynamicApi";
import {
  FiX,
  FiBriefcase,
  FiFileText,
  FiTrendingUp,
  FiCheckCircle,
} from "react-icons/fi";

const RecruitmentModel = ({ isOpen, onClose, onSave, recruitment }) => {
  const [createRecruitment, { isLoading: isCreating }] = useCreateFuctionMutation();
  const [updateRecruitment, { isLoading: isUpdating }] = useUpdateFunctionMutation();

  const [formData, setFormData] = useState({
    jobTitle: "",
    description: "",
    status: "open"
  });

  const isLoading = isCreating || isUpdating;
  const isEditing = !!recruitment;

  const statusOptions = {
    status: [
      { value: "open", label: "Open" },
      { value: "closed", label: "Closed" },
      { value: "hired", label: "Hired" }
    ],
  };

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
  }, [recruitment, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await updateRecruitment({
          url: "recruitment",
          id: recruitment._id,
          formData: formData,
        }).unwrap();
      } else {
        await createRecruitment({
          url: "recruitment",
          formData: formData,
        }).unwrap();
      }

      onSave(); // Notify parent component
    } catch (error) {
      console.error("Error saving recruitment:", error);
      // Handle error (show toast/notification)
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
        {/* Header */}
        <div className="p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-blue-700">
                {isEditing ? "Edit Job Position" : "Create New Job Position"}
              </h2>
              <p className="text-blue-800 mt-1">
                {isEditing
                  ? "Update job position details"
                  : "Add new job opening to attract talented candidates"}
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

        <form onSubmit={handleSubmit} className="px-6 pb-6">
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
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="e.g., Senior Software Engineer, Marketing Manager"
                required
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
                onChange={handleInputChange}
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none"
                placeholder="Describe the role, responsibilities, requirements, and what you're looking for in a candidate..."
                required
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
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                {statusOptions.status.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.jobTitle || !formData.description}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <TailSpin height={20} width={20} color="#FFFFFF" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : isEditing ? (
                  <>
                    Update Job
                    <FiCheckCircle className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Create Job
                    <FiCheckCircle className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecruitmentModel;