import React, { useState, useEffect } from "react";
import { TailSpin } from "react-loader-spinner";
import { FiX, FiCheckCircle } from "react-icons/fi";
import {
  useCreateFuctionMutation,
  useUpdateFunctionMutation,
} from "../../store/DynamicApi";

const ShiftModel = ({ isOpen, onClose, onSave, shift }) => {
  const [createShift, { isLoading: isCreating }] = useCreateFuctionMutation();
  const [updateShift, { isLoading: isUpdating }] = useUpdateFunctionMutation();

  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
    status: "Active",
  });

  const isLoading = isCreating || isUpdating;
  const isEditing = !!shift;

  // ✅ Safer and simpler update when modal opens
  useEffect(() => {
    if (shift) {
      setFormData({
        name: shift.name || "",
        startTime: shift.startTime || "",
        endTime: shift.endTime || "",
        status: shift.status || "Active",
      });
    } else {
      setFormData({
        name: "",
        startTime: "",
        endTime: "",
        status: "Active",
      });
    }
  }, [shift, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const today = new Date();
      const startTime = new Date(
        `${today.toDateString()} ${formData.startTime}`
      );
      const endTime = new Date(`${today.toDateString()} ${formData.endTime}`);

      if (endTime <= startTime) {
        alert("End time must be after start time");
        return;
      }

      const payload = {
        name: formData.name,
        startTime,
        endTime,
        status: formData.status,
      };

      if (isEditing) {
        await updateShift({
          url: "shifts",
          id: shift._id,
          formData: payload,
        }).unwrap();
      } else {
        await createShift({ url: "shifts", formData: payload }).unwrap();
      }

      onSave();
    } catch (error) {
      console.error("Error saving shift:", error);
      alert(error?.data?.message || "Failed to save shift");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl border border-gray-200 overflow-y-auto">
        <div className="p-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-blue-700">
              {isEditing ? "Edit Shift" : "Add New Shift"}
            </h2>
            <p className="text-blue-800 mt-1">
              {isEditing
                ? "Update shift schedule"
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

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Shift Name
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
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>
          </div>

          <div>
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

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              {isLoading ? (
                <TailSpin height={20} width={20} color="#FFFFFF" />
              ) : isEditing ? (
                <>
                  Update Shift <FiCheckCircle className="w-5 h-5" />
                </>
              ) : (
                <>
                  Create Shift <FiCheckCircle className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShiftModel;
