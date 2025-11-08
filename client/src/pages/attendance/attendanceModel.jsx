import React, { useState, useEffect } from "react";
import { TailSpin } from "react-loader-spinner";
import {
  useCreateFuctionMutation,
  useUpdateFunctionMutation,
  useGetallFunctionQuery,
} from "../../store/DynamicApi";
import {
  FiX,
  FiUser,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiArrowLeft,
  FiWatch,
  FiActivity,
  FiFileText,
} from "react-icons/fi";
import { toast } from "react-toastify";
const AttendanceModal = ({ isOpen, onClose, onSave, attendance }) => {
  const [createAttendance, { isLoading: isCreating }] =
    useCreateFuctionMutation();
  const [updateAttendance, { isLoading: isUpdating }] =
    useUpdateFunctionMutation();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    employee: "",
    shift: "",
    date: "",
    checkIn: "",
    checkOut: "",
    status: "Present",
  });

  const isLoading = isCreating || isUpdating;
  const isEditing = !!attendance;

  const { data } = useGetallFunctionQuery({ url: "/employees" });
  const { data: shiftData } = useGetallFunctionQuery({ url: "/shifts" });

  const statusOptions = [
    { value: "Present", label: "Present" },
    { value: "Absent", label: "Absent" },
    { value: "On Leave", label: "On Leave" },
    { value: "Late", label: "Late" },
    { value: "Half Day", label: "Half Day" },
  ];

  // Calculate duration
  const calculateDuration = () => {
    if (formData.checkIn && formData.checkOut) {
      const [startHours, startMinutes] = formData.checkIn
        .split(":")
        .map(Number);
      const [endHours, endMinutes] = formData.checkOut.split(":").map(Number);

      let totalMinutes =
        endHours * 60 + endMinutes - (startHours * 60 + startMinutes);
      if (totalMinutes < 0) totalMinutes += 24 * 60;

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`.trim();
    }
    return "";
  };

  const duration = calculateDuration();

  useEffect(() => {
    if (attendance) {
      setFormData({
        employee: attendance.employee?._id || "",
        shift: attendance.shift?._id || "",
        date: attendance.date ? attendance.date.split("T")[0] : "",
        checkIn: attendance.checkIn
          ? new Date(attendance.checkIn).toTimeString().slice(0, 5)
          : "",
        checkOut: attendance.checkOut
          ? new Date(attendance.checkOut).toTimeString().slice(0, 5)
          : "",
        status: attendance.status || "Present",
      });
      
    } else {
      setFormData({
        employee: "",
        shift: "",
        date: new Date().toISOString().split("T")[0],
        checkIn: "",
        checkOut: "",
        status: "Present",
      });
    }
    setCurrentStep(1);
  }, [attendance, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setCurrentStep(2);
  const prevStep = () => setCurrentStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        checkIn: formData.checkIn
          ? `${formData.date}T${formData.checkIn}:00`
          : null,
        checkOut: formData.checkOut
          ? `${formData.date}T${formData.checkOut}:00`
          : null,
        workedHours: duration
          ? parseFloat(duration.replace("h", "").replace("m", "").trim()) / 60
          : 0,
      };

      if (isEditing) {
        await updateAttendance({
          url: "attendance",
          id: attendance._id,
          formData: payload,
        }).unwrap();
        toast.success("Attendance record updated successfully!");
      } else {
        await createAttendance({
          url: "attendance",
          formData: payload,
        }).unwrap();
        toast.success("Attendance record created successfully!");
      }
      onSave();
    } catch (err) {
      console.error("Error saving attendance:", err);
    }
  };

  const isBasicInfoValid = () =>
    formData.employee && formData.shift && formData.date;
  
  const isTimeInfoValid = () => formData.status;

  if (!isOpen) return null;

  const employees = data?.employees || [];
  const shifts = shiftData?.shifts || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
        {/* Header */}
        <div className="p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-blue-700">
                {isEditing ? "Edit Attendance" : "Add Attendance Record"}
              </h2>
              <p className="text-blue-800 mt-1">
                {isEditing
                  ? "Update employee attendance details"
                  : "Create new attendance record for employee"}
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
                <FiClock className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-sm font-medium ${
                    currentStep >= 2 ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  Time & Status
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
                    name="employee"
                    value={formData.employee}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.fullname || emp.name} - {emp.position || "-"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-blue-600" />
                    Shift *
                  </label>
                  <select
                    name="shift"
                    value={formData.shift}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    required
                  >
                    <option value="">Select Shift</option>
                    {shiftData?.shifts?.map((shift) => (
                      <option key={shift._id} value={shift._id}>
                        {shift.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiCalendar className="w-4 h-4 text-blue-600" />
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
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
                    <FiClock className="w-4 h-4 text-blue-600" />
                    Check In Time
                  </label>
                  <input
                    type="time"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-blue-600" />
                    Check Out Time
                  </label>
                  <input
                    type="time"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiActivity className="w-4 h-4 text-blue-600" />
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duration Preview */}
              {duration && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FiWatch className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-700">
                        Total Duration: {duration}
                      </span>
                    </div>
                    <div
                      className={`text-sm font-medium px-3 py-1 rounded-full ${
                        formData.status === "Present"
                          ? "bg-green-100 text-green-800"
                          : formData.status === "Absent"
                          ? "bg-red-100 text-red-800"
                          : formData.status === "On Leave"
                          ? "bg-yellow-100 text-yellow-800"
                          : formData.status === "Late"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {formData.status}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  <FiArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!isTimeInfoValid() || isLoading}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <TailSpin height={20} width={20} color="#FFFFFF" />
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : isEditing ? (
                    <>
                      Update Record
                      <FiCheckCircle className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Create Record
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

export default AttendanceModal;
