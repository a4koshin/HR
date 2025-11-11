import React, { useState, useEffect } from "react";
import { TailSpin } from "react-loader-spinner";
import { useCreateFuctionMutation, useUpdateFunctionMutation } from "../../store/DynamicApi";
import {
  FiX,
  FiUser,
  FiCalendar,
  FiClock,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiThumbsUp,
  FiThumbsDown,
} from "react-icons/fi";

const LeaveModal = ({ isOpen, onClose, leave, employees, shifts, refetchLeaves, currentUser }) => {
  const [createLeave, { isLoading: isCreating }] = useCreateFuctionMutation();
  const [updateLeave, { isLoading: isUpdating }] = useUpdateFunctionMutation();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    emp_id: "",
    type: "Sick",
    startDate: "",
    endDate: "",
    reason: "",
    shift_id: "",
    duration: "",
  });

  
  const [approvalData, setApprovalData] = useState({
    status: "Pending",
    approvedBy: "",
  });

  const [error, setError] = useState(""); // Add error state

  const isLoading = isCreating || isUpdating;
  const isEditing = !!leave;
  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "hr";

  const leaveTypes = [
    { value: "Sick", label: "Sick Leave" },
    { value: "Vacation", label: "Vacation" },
    { value: "Unpaid", label: "Unpaid Leave" },
    { value: "Other", label: "Other" },
  ];

  const statusOptions = [
    { value: "Pending", label: "Pending", icon: FiClock, color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
    { value: "Approved", label: "Approved", icon: FiThumbsUp, color: "text-green-600 bg-green-50 border-green-200" },
    { value: "Rejected", label: "Rejected", icon: FiThumbsDown, color: "text-red-600 bg-red-50 border-red-200" },
  ];

  useEffect(() => {
    if (leave) {
      setFormData({
        emp_id: leave.emp_id?._id || "",
        type: leave.type || "Sick",
        startDate: leave.startDate ? leave.startDate.split("T")[0] : "",
        endDate: leave.endDate ? leave.endDate.split("T")[0] : "",
        reason: leave.reason || "",
        shift_id: leave.shift_id?._id || "",
        duration: leave.duration ? leave.duration.toString() : "",
      });

      setApprovalData({
        status: leave.status || "Pending",
        approvedBy: leave.approvedBy || currentUser?._id || "",
      });
    } else {
      setFormData({
        emp_id: "",
        type: "Sick",
        startDate: "",
        endDate: "",
        reason: "",
        shift_id: "",
        duration: "",
      });
      setApprovalData({
        status: "Pending",
        approvedBy: currentUser?._id || "",
      });
    }
    setError(""); // Clear error when modal opens
    setCurrentStep(1);
  }, [leave, isOpen, currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error when user makes changes

    if (name === "startDate" || name === "endDate") {
      const start = name === "startDate" ? value : formData.startDate;
      const end = name === "endDate" ? value : formData.endDate;
      if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        setFormData((prev) => ({ ...prev, duration: duration > 0 ? duration.toString() : "" }));
      }
    }
  };

  const handleStatusChange = (e) => {
    const { value } = e.target;
    setApprovalData({
      status: value,
      approvedBy: currentUser?._id || "",
    });
  };

  const nextStep = () => {
    if (isBasicInfoValid()) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    
    try {
      const submitData = { ...formData };

      if (isEditing) {
        await updateLeave({ 
          url: "/leaves", 
          id: leave._id, 
          formData: submitData 
        }).unwrap();
      } else {
        await createLeave({ 
          url: "/leaves", 
          formData: submitData 
        }).unwrap();
      }
      
      refetchLeaves();
      onClose();
    } catch (err) {
      console.error("Error submitting leave:", err);
      
      // Display the specific error message from backend
      if (err.data?.message) {
        setError(err.data.message);
      } else {
        setError("Failed to submit leave application. Please try again.");
      }
    }
  };

  const isBasicInfoValid = () => {
    return formData.emp_id && formData.type && formData.startDate && formData.endDate;
  };

  const getStatusBadge = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    const IconComponent = statusOption?.icon || FiAlertCircle;
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusOption?.color || "text-gray-600 bg-gray-50 border-gray-200"}`}>
        <IconComponent className="w-4 h-4" />
        {statusOption?.label || status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
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
                {isEditing ? "Edit Leave Application" : "Apply for Leave"}
              </h2>
              <p className="text-blue-800 mt-1">
                {isEditing
                  ? "Update leave application details"
                  : "Submit a new leave application"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-700 hover:bg-blue-100 hover:text-blue-500 p-2 rounded-xl transition duration-200"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-red-700 font-medium">Unable to submit leave</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Current Status Display */}
          {isEditing && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Status</p>
                  <div className="mt-1">
                    {getStatusBadge(leave.status)}
                  </div>
                </div>
                {leave.status !== "Pending" && leave.approvedAt && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {leave.status} on {formatDate(leave.approvedAt)}
                    </p>
                    {leave.approvedBy && (
                      <p className="text-xs text-gray-500">
                        by {leave.approvedBy.fullname || "Administrator"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
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
                <FiUser className="w-5 h-5" />
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
                <FiFileText className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-sm font-medium ${
                    currentStep >= 2 ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  Additional Info
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
                    name="emp_id"
                    value={formData.emp_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    required
                    disabled={isEditing && !isAdmin}
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.fullname}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiFileText className="w-4 h-4 text-blue-600" />
                    Leave Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    required
                  >
                    {leaveTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiCalendar className="w-4 h-4 text-blue-600" />
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiCalendar className="w-4 h-4 text-blue-600" />
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    required
                  />
                </div>
              </div>

              {formData.duration && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700 font-semibold">
                      Leave Duration
                    </span>
                    <span className="text-blue-900 font-bold text-lg">
                      {formData.duration} day(s)
                    </span>
                  </div>
                </div>
              )}

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
              {/* Status Update Section - Only for Admin when editing */}
              {isAdmin && isEditing && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FiCheckCircle className="w-5 h-5 text-blue-600" />
                    Leave Approval
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Update Status
                      </label>
                      <select
                        name="status"
                        value={approvalData.status}
                        onChange={handleStatusChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {approvalData.status !== "Pending" && approvalData.status !== leave?.status && (
                      <div className="bg-white border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-700 font-medium">
                          This leave will be marked as {approvalData.status.toLowerCase()} immediately upon submission.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-blue-600" />
                    Shift
                  </label>
                  <select
                    name="shift_id"
                    value={formData.shift_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  >
                    <option value="">Select Shift (optional)</option>
                    {shifts.map((shift) => (
                      <option key={shift._id} value={shift._id}>
                        {shift.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiFileText className="w-4 h-4 text-blue-600" />
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Leave duration"
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FiFileText className="w-4 h-4 text-blue-600" />
                  Reason
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  rows={4}
                  placeholder="Enter reason for leave (optional)"
                ></textarea>
              </div>

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
                  disabled={isLoading}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-8 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <TailSpin height={20} width={20} color="#FFFFFF" />
                      {isEditing ? "Updating..." : "Submitting..."}
                    </>
                  ) : isEditing ? (
                    <>
                      Update Leave
                      <FiCheckCircle className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Submit Application
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

export default LeaveModal;