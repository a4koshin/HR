import React, { useState, useEffect } from "react";
import { TailSpin } from "react-loader-spinner";
import {
  FiX,
  FiClock,
  FiCalendar,
  FiUsers,
  FiCheckCircle,
} from "react-icons/fi";
import {
  useCreateFuctionMutation,
  useUpdateFunctionMutation,
  useGetallFunctionQuery,
} from "../../store/DynamicApi";

const ShiftModel = ({ isOpen, onClose, onSave, shift }) => {
  const [createShift, { isLoading: isCreating }] = useCreateFuctionMutation();
  const [updateShift, { isLoading: isUpdating }] = useUpdateFunctionMutation();
  const { data: shiftData } = useGetallFunctionQuery({ url: "/shifts" });

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
    assignedEmployees: [],
    status: "Active",
  });

  const isLoading = isCreating || isUpdating;
  const isEditing = !!shift;

  useEffect(() => {
    if (shift) {
      setFormData({
        name: shift.name || "",
        startTime: shift.startTime
          ? shift.startTime.split("T")[0] +
            "T" +
            shift.startTime.split("T")[1].slice(0, 5)
          : "",
        endTime: shift.endTime
          ? shift.endTime.split("T")[0] +
            "T" +
            shift.endTime.split("T")[1].slice(0, 5)
          : "",
        assignedEmployees: shift.assignedEmployees?.map((emp) => emp._id) || [],
        status: shift.status || "Active",
      });
    } else {
      setFormData({
        name: "",
        startTime: "",
        endTime: "",
        assignedEmployees: [],
        status: "Active",
      });
    }
    setCurrentStep(1);
  }, [shift, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmployeeSelection = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (opt) => opt.value
    );
    setFormData((prev) => ({
      ...prev,
      assignedEmployees: selectedOptions,
    }));
  };

  const nextStep = () => setCurrentStep(2);
  const prevStep = () => setCurrentStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateShift({
          url: "shifts",
          id: shift._id,
          formData,
        }).unwrap();
      } else {
        await createShift({
          url: "shifts",
          formData,
        }).unwrap();
      }
      onSave();
    } catch (error) {
      console.error("Error saving shift:", error);
    }
  };

  const isStep1Valid = formData.name && formData.startTime && formData.endTime;
  const isStep2Valid = formData.assignedEmployees.length > 0;

  if (!isOpen) return null;

  const employees = shiftData?.employees || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
        {/* Header */}
        <div className="p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-blue-700">
                {isEditing ? "Edit Shift" : "Add New Shift"}
              </h2>
              <p className="text-blue-800 mt-1">
                {isEditing
                  ? "Update shift schedule and employees"
                  : "Create a new work shift for your team"}
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
                }`}
              >
                <FiClock className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-sm font-medium ${
                    currentStep >= 1 ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  Shift Info
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
                }`}
              >
                <FiUsers className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-sm font-medium ${
                    currentStep >= 2 ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  Assigned Employees
                </span>
                <span className="text-xs text-gray-400">Step 2</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6">
          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Shift Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="Enter shift name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Time *
                    </label>
                    <input
                      type="datetime-local"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Time *
                    </label>
                    <input
                      type="datetime-local"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStep1Valid}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  Continue
                  <FiCheckCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Employees *
                </label>
                <select
                  multiple
                  name="assignedEmployees"
                  value={formData.assignedEmployees}
                  onChange={handleEmployeeSelection}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 h-40"
                >
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.fullname} — {emp.position} ({emp.department?.name})
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  Hold Ctrl/Cmd to select multiple employees.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!isStep2Valid || isLoading}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <TailSpin height={20} width={20} color="#FFFFFF" />
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : isEditing ? (
                    <>
                      Update Shift
                      <FiCheckCircle className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Create Shift
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

export default ShiftModel;
