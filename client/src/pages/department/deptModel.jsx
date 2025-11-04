import React, { useState, useEffect } from "react";
import { TailSpin } from "react-loader-spinner";
import { FiCheckCircle, FiX, FiActivity } from "react-icons/fi";
import { Building } from "lucide-react";
import {
  useCreateFuctionMutation,
  useUpdateFunctionMutation,
} from "../../store/DynamicApi";

const DeptModel = ({ isOpen, onClose, onSave, department }) => {
  const [createDepartment, { isLoading: isCreating }] = useCreateFuctionMutation();
  const [updateDepartment, { isLoading: isUpdating }] = useUpdateFunctionMutation();

  const [formData, setFormData] = useState({
    name: "",
    status: "Active",
    description: "",
    headCount: "",
  });

  const isEditing = !!department;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || "",
        status: department.status || "Active",
        description: department.description || "",
        headCount: department.headCount || "",
      });
    } else {
      setFormData({
        name: "",
        status: "Active",
        description: "",
        headCount: "",
      });
    }
  }, [department, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Normalize status for Joi validation (capitalize first letter)
    const normalizedData = {
      ...formData,
      status:
        formData.status.charAt(0).toUpperCase() +
        formData.status.slice(1).toLowerCase(),
    };

    try {
      if (isEditing) {
        await updateDepartment({
          url: "departments",
          id: department._id,
          formData: normalizedData,
        }).unwrap();
      } else {
        await createDepartment({
          url: "departments",
          formData: normalizedData,
        }).unwrap();
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving department:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
        {/* Header */}
        <div className="p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Building className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-blue-700">
                  {isEditing ? "Edit Department" : "Create Department"}
                </h2>
                <p className="text-blue-700 text-sm">
                  {isEditing
                    ? "Update department information"
                    : "Add a new department to your organization"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-blue-700 hover:bg-blue-100 hover:text-blue-500 p-2 rounded-xl transition duration-200"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Department Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              Department Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="e.g., Human Resources, IT, Finance"
            />
          </div>

          {/* Status */}
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Buttons */}
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
              disabled={isLoading || !formData.name}
              className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <TailSpin height={20} width={20} color="#FFFFFF" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                <>
                  Update Department
                  <FiCheckCircle className="w-5 h-5" />
                </>
              ) : (
                <>
                  Create Department
                  <FiCheckCircle className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeptModel;
