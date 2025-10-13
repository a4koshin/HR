import React, { useState, useEffect } from "react";
import { TailSpin } from "react-loader-spinner";
import { FiCheckCircle,FiX } from "react-icons/fi"; 
import { Building  } from "lucide-react"; 
import { useCreateFuctionMutation, useUpdateFunctionMutation } from "../../store/DynamicApi";

const DeptModel = ({ isOpen, onClose, onSave, department }) => {
  const [createDepartment, { isLoading: isCreating }] = useCreateFuctionMutation();
  const [updateDepartment, { isLoading: isUpdating }] = useUpdateFunctionMutation();
  const [formData, setFormData] = useState({
    name: "",
    status: "Active",
  });

  const isEditing = !!department;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || "",
        status: department.status || "Active",
      });
    } else {
      setFormData({
        name: "",
        status: "Active",
      });
    }
  }, [department, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateDepartment({ url: "departments", id: department._id, formData }).unwrap();
      } else {
        await createDepartment({ url: "departments", formData }).unwrap();
      }
      onSave();
    } catch (error) {
      console.error("Error saving department:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Building className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">
              {isEditing ? "Edit Department" : "Add New Department"}
            </h2>
          </div>
          <button onClick={onClose} className="text-white hover:bg-blue-500 p-2 rounded-xl transition duration-200">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="Enter department name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:text-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 font-medium"
            >
              {isLoading ? (
                <>
                  <TailSpin height={20} width={20} color="#FFFFFF" />
                  {isEditing ? "Updating..." : "Saving..."}
                </>
              ) : isEditing ? (
                <>
                  Update Department
                  <FiCheckCircle className="w-5 h-5" />
                </>
              ) : (
                <>
                  Add Department
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
