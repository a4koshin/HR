import React, { useState, useEffect } from "react";
import { FiX, FiSave, FiTrendingUp, FiUser, FiCalendar, FiClock, FiUsers } from "react-icons/fi";
import {
  useCreateFuctionMutation,
  useUpdateFunctionMutation,
  useGetallFunctionQuery,
} from "../../store/DynamicApi";
import { TailSpin } from "react-loader-spinner";

const TrainingModel = ({ isOpen, onClose, training, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    trainer: "",
    startDate: "",
    endDate: "",
    participants: [],
    completionStatus: "Not Started"
  });

  const [createFunction, { isLoading: isCreating }] = useCreateFuctionMutation();
  const [updateFunction, { isLoading: isUpdating }] = useUpdateFunctionMutation();
  const { data: employeesData } = useGetallFunctionQuery({ url: "/employees" });

  const isLoading = isCreating || isUpdating;
  const isEditing = !!training;
  const employees = employeesData?.employees || [];

  const statusOptions = [
    { value: "Not Started", label: "⏳ Not Started", color: "text-gray-600" },
    { value: "In Progress", label: "🔄 In Progress", color: "text-yellow-600" },
    { value: "Completed", label: "✅ Completed", color: "text-green-600" }
  ];

  useEffect(() => {
    if (training) {
      setFormData({
        title: training.title || "",
        description: training.description || "",
        trainer: training.trainer || "",
        startDate: training.startDate ? new Date(training.startDate).toISOString().split('T')[0] : "",
        endDate: training.endDate ? new Date(training.endDate).toISOString().split('T')[0] : "",
        participants: training.participants?.map(p => p._id) || [],
        completionStatus: training.completionStatus || "Not Started"
      });
    } else {
      // Set default dates (start: today, end: 7 days from today)
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      setFormData({
        title: "",
        description: "",
        trainer: "",
        startDate: today.toISOString().split('T')[0],
        endDate: nextWeek.toISOString().split('T')[0],
        participants: [],
        completionStatus: "Not Started"
      });
    }
  }, [training]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleParticipantChange = (employeeId) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(employeeId)
        ? prev.participants.filter(id => id !== employeeId)
        : [...prev.participants, employeeId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateFunction({
          id: training._id,
          url: "/trainings",
          formData,
        }).unwrap();
      } else {
        await createFunction({
          url: "/trainings",
          formData,
        }).unwrap();
      }

      onSave();
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save training program");
    }
  };

  const getDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
    return "N/A";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <FiTrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isEditing ? "Edit Training Program" : "Create New Training Program"}
                </h2>
                <p className="text-blue-100 text-sm">
                  {isEditing ? "Update training program details" : "Add new training program for employee development"}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FiTrendingUp className="w-4 h-4 text-blue-600" />
                  Training Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="e.g., Leadership Development, Technical Skills Training"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FiUser className="w-4 h-4 text-blue-600" />
                  Trainer *
                </label>
                <input
                  type="text"
                  name="trainer"
                  value={formData.trainer}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter trainer's name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
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
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FiClock className="w-4 h-4 text-blue-600" />
                  Status
                </label>
                <select
                  name="completionStatus"
                  value={formData.completionStatus}
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

            {/* Right Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FiUsers className="w-4 h-4 text-blue-600" />
                  Participants
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl bg-gray-50 p-3">
                  {employees.map(employee => (
                    <label key={employee._id} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.participants.includes(employee._id)}
                        onChange={() => handleParticipantChange(employee._id)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{employee.fullname}</p>
                        <p className="text-xs text-gray-500">{employee.role || employee.position}</p>
                      </div>
                    </label>
                  ))}
                  {employees.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No employees available</p>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {formData.participants.length} employee(s) selected
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FiTrendingUp className="w-4 h-4 text-blue-600" />
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none"
              placeholder="Describe the training objectives, topics covered, and expected outcomes..."
            />
          </div>

          {/* Preview Section */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Training Preview</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Title:</span>
                <span className="font-medium text-gray-900">{formData.title || "Not specified"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trainer:</span>
                <span className="font-medium text-gray-900">{formData.trainer || "Not specified"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium text-gray-900">{getDuration()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Participants:</span>
                <span className="font-medium text-gray-900">{formData.participants.length} selected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  formData.completionStatus === "Not Started" ? "text-gray-600" :
                  formData.completionStatus === "In Progress" ? "text-yellow-600" : "text-green-600"
                }`}>
                  {formData.completionStatus || "Not specified"}
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
              disabled={isLoading || !formData.title || !formData.trainer || !formData.startDate || !formData.endDate}
              className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <TailSpin height={20} width={20} color="#FFFFFF" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                <>
                  Update Training
                  <FiSave className="w-5 h-5" />
                </>
              ) : (
                <>
                  Create Training
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

export default TrainingModel;