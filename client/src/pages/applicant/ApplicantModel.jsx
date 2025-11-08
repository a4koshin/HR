import React, { useState, useEffect } from "react";
import { TailSpin } from "react-loader-spinner";
import {
  useCreateFuctionMutation,
  useUpdateFunctionMutation,
} from "../../store/DynamicApi";
import {
  FiX,
  FiUser,
  FiMail,
  FiBriefcase,
  FiTrendingUp,
  FiCheckCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";
const ApplicantModel = ({ isOpen, onClose, onSave, applicant, jobs }) => {
  const [createApplicant, { isLoading: isCreating }] = useCreateFuctionMutation();
  const [updateApplicant, { isLoading: isUpdating }] = useUpdateFunctionMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    appliedJob: "",
    status: "applied"
  });

  const isLoading = isCreating || isUpdating;
  const isEditing = !!applicant;

  const statusOptions = {
    status: [
      { value: "applied", label: "Applied" },
      { value: "interview", label: "Interview" },
      { value: "hired", label: "Hired" },
      { value: "rejected", label: "Rejected" }
    ],
  };

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
  }, [applicant, isOpen]);

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
        await updateApplicant({
          url: "applicants",
          id: applicant._id,
          formData: formData,
        }).unwrap();
        toast.success("Applicant updated successfully.");
      } else {
        await createApplicant({
          url: "applicants",
          formData: formData,
        }).unwrap();
        toast.success("Applicant created successfully.");
      }

      onSave(); // Notify parent component
    } catch (error) {
      console.error("Error saving Applicants:", error);
      const message =
        error?.data?.message ||
        "❌ Something went wrong while saving Applicants .";
      toast.error(message);
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
                {isEditing ? "Edit Applicant" : "Add New Applicant"}
              </h2>
              <p className="text-blue-800 mt-1">
                {isEditing
                  ? "Update applicant information"
                  : "Add new job applicant to your pipeline"}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FiUser className="w-4 h-4 text-blue-600" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter applicant's full name"
                  required
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
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter applicant's email address"
                  required
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
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  required
                >
                  <option value="">Select Job Position</option>
                  {jobs.map(job => (
                    <option key={job._id} value={job._id}>
                      {job.title || job.jobTitle} {job.department ? `- ${job.department}` : ''}
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
                disabled={isLoading || !formData.name || !formData.email || !formData.appliedJob}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <TailSpin height={20} width={20} color="#FFFFFF" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : isEditing ? (
                  <>
                    Update Applicant
                    <FiCheckCircle className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Create Applicant
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

export default ApplicantModel;