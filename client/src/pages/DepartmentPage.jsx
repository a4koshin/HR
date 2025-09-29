// src/pages/DepartmentPage.jsx
import React, { useState, useEffect } from "react";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../services/departmentService";
import { Building, Plus, Edit, Trash2 } from "lucide-react";

const DepartmentPage = () => {
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Active",
    manager: "",
    contactEmail: "",
    contactPhone: "",
  });

  // Fetch all departments
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await getDepartments();
      setDepartments(data.departments || data);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setError("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (editingDepartment) {
        const updated = await updateDepartment(editingDepartment._id, formData);
        setDepartments(
          departments.map((d) => (d._id === updated._id ? updated : d))
        );
        setSuccess("Department updated successfully!");
      } else {
        const created = await createDepartment(formData);
        setDepartments([...departments, created]);
        setSuccess("Department created successfully!");
      }
      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving department:", err);
      setError(err.response?.data?.message || "Failed to save department");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || "",
      status: department.status,
      manager: department.manager || "",
      contactEmail: department.contactEmail || "",
      contactPhone: department.contactPhone || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this department? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await deleteDepartment(id);
      setDepartments(departments.filter((d) => d._id !== id));
      setSuccess("Department deleted successfully!");
    } catch (err) {
      console.error("Error deleting department:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to delete department";

      // Check if it's a foreign key constraint error
      if (
        errorMessage.includes("employees") ||
        errorMessage.includes("associated")
      ) {
        setError(
          "Cannot delete department. There are employees assigned to this department. Please reassign them first."
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      status: "Active",
      manager: "",
      contactEmail: "",
      contactPhone: "",
    });
    setEditingDepartment(null);
    setError("");
    setSuccess("");
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const getStatusBadge = (status) => {
    if (status === "Active") {
      return "px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800";
    } else {
      return "px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800";
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Department Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage organizational departments and teams
              </p>
            </div>

            <button
              onClick={openAddModal}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition duration-200"
            >
              <Plus className="h-5 w-5" />
              {loading ? "Loading..." : "Add New Department"}
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Add Department Button */}
        <div className="mb-6"></div>

        {/* Departments Table */}
        {loading && departments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">⏳</div>
            <p className="text-gray-500">Loading departments...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {departments.map((department) => (
                    <tr key={department._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {department.name}
                          </div>
                          {department.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {department.description}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(department.status)}>
                          {department.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {department.createdAt
                          ? new Date(department.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(department)}
                          disabled={loading}
                          className="text-indigo-600 hover:text-indigo-900 mr-4 disabled:text-gray-400"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(department._id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && departments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏢</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No departments found
            </h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first department.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Building className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold">
                  {editingDepartment ? "Edit Department" : "Add New Department"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={loading}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:text-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 font-medium"
                  >
                    {loading
                      ? "Saving..."
                      : editingDepartment
                      ? "Update Department"
                      : "Add Department"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentPage;
