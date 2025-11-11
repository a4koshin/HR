import React, { useState, useEffect } from "react";
import { TailSpin } from "react-loader-spinner";
import {
  useCreateFuctionMutation,
  useUpdateFunctionMutation,
  useGetallFunctionQuery,
} from "../../store/DynamicApi";
import {
  FiX,
  FiTrendingUp,
  FiUser,
  FiCalendar,
  FiClock,
  FiUsers,
  FiCheckCircle,
} from "react-icons/fi";
import {toast} from "react-toastify";
const TrainingModel = ({ isOpen, onClose, onSave, training }) => {
  const [createTraining, { isLoading: isCreating }] = useCreateFuctionMutation();
  const [updateTraining, { isLoading: isUpdating }] = useUpdateFunctionMutation();
  const { data: employeesData } = useGetallFunctionQuery({ url: "/employees/all" });

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    trainer: "",
    startDate: "",
    endDate: "",
    participants: [],
    completionStatus: "Not Started",
  });

  const isLoading = isCreating || isUpdating;
  const isEditing = !!training;

  const statusOptions = {
    completionStatus: [
      { value: "Not Started", label: "Not Started" },
      { value: "In Progress", label: "In Progress" },
      { value: "Completed", label: "Completed" },
    ],
  };

  useEffect(() => {
    if (training) {
      setFormData({
        title: training.title || "",
        description: training.description || "",
        trainer: training.trainer || "",
        startDate: training.startDate ? new Date(training.startDate).toISOString().split('T')[0] : "",
        endDate: training.endDate ? new Date(training.endDate).toISOString().split('T')[0] : "",
        participants: training.participants?.map(p => p._id) || [],
        completionStatus: training.completionStatus || "Not Started",
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
        completionStatus: "Not Started",
      });
    }
    setCurrentStep(1);
  }, [training, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleParticipantChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      participants: selectedOptions,
    }));
  };

  const nextStep = () => {
    setCurrentStep(2);
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await updateTraining({
          url: "trainings",
          id: training._id,
          formData: formData,
        }).unwrap();
        toast.success("Training updated successfully");
      } else {
        await createTraining({
          url: "trainings",
          formData: formData,
        }).unwrap();
        toast.success("Training created successfully");
      }

      onSave(); // Notify parent component
    } catch (error) {
      console.error("Error saving Training:", error);
      const message =
        error?.data?.message ||
        "❌ Something went wrong while saving training.";
      toast.error(message);
    }
  };

  const isBasicInfoValid = () => {
    return (
      formData.title && formData.trainer && formData.startDate && formData.endDate
    );
  };

  if (!isOpen) return null;

  const employees = employeesData?.employees || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
        {/* Header */}
        <div className="p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-blue-700">
                {isEditing ? "Edit Training Program" : "Create New Training Program"}
              </h2>
              <p className="text-blue-800 mt-1">
                {isEditing
                  ? "Update training program details"
                  : "Add new training program for employee development"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-700 hover:bg-blue-100 hover:text-blue-500 p-2 rounded-md transition duration-200"
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
                <FiTrendingUp className="w-5 h-5" />
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
                <FiUsers className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-sm font-medium ${
                    currentStep >= 2 ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  Details
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
                    <FiTrendingUp className="w-4 h-4 text-blue-600" />
                    Training Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Enter training title"
                    required
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
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Enter trainer's name"
                    required
                  />
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isBasicInfoValid()}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-8 py-3 rounded-md font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  Continue
                  <FiCheckCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiTrendingUp className="w-4 h-4 text-blue-600" />
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none"
                    placeholder="Describe the training objectives, topics covered, and expected outcomes..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-blue-600" />
                    Status
                  </label>
                  <select
                    name="completionStatus"
                    value={formData.completionStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  >
                    {statusOptions.completionStatus.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiUsers className="w-4 h-4 text-blue-600" />
                    Participants
                  </label>
                  <select
                    multiple
                    name="participants"
                    value={formData.participants}
                    onChange={handleParticipantChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none h-32"
                  >
                    {employees.map((employee) => (
                      <option key={employee._id} value={employee._id}>
                        {employee.fullname} - {employee.role || employee.position}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500">
                    Hold Ctrl/Cmd to select multiple participants. {formData.participants.length} employee(s) selected
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-md font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-8 py-3 rounded-md font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <TailSpin height={20} width={20} color="#FFFFFF" />
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : isEditing ? (
                    <>
                      Update Training
                      <FiCheckCircle className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Create Training
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

export default TrainingModel;