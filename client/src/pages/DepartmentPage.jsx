import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchDepartments,
  createDepartmentAsync,
  updateDepartmentAsync,
  deleteDepartmentAsync,
} from "../slices/departmentSlice";
import { Building, Plus } from "lucide-react";
import { TailSpin } from "react-loader-spinner";

const DepartmentPage = () => {
  const dispatch = useDispatch();
  const { departments, fetchLoading, actionLoading, error } = useSelector(
    (state) => state.department
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Active",
    manager: "",
    contactEmail: "",
    contactPhone: "",
  });

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        await dispatch(
          updateDepartmentAsync({ id: editingDepartment._id, data: formData })
        ).unwrap();
      } else {
        await dispatch(createDepartmentAsync(formData)).unwrap();
      }
      closeModal();
    } catch (err) {
      console.error("Error saving department:", err);
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
    if (!window.confirm("Are you sure you want to delete this department?"))
      return;
    try {
      await dispatch(deleteDepartmentAsync(id)).unwrap();
    } catch (err) {
      console.error("Error deleting department:", err);
      alert(err);
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
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const getStatusBadge = (status) =>
    status === "Active"
      ? "px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
      : "px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800";

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-3">
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
            disabled={actionLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition duration-200"
          >
            <Plus className="h-5 w-5" />
            {actionLoading ? (
              <div className="flex items-center gap-2">
                <TailSpin height={20} width={20} color="#FFFFFF" />
                Loading...
              </div>
            ) : (
              "Add New Department"
            )}
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Departments Table */}
        {fetchLoading ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
            <div className="flex justify-center mb-4">
              <TailSpin
                height={40}
                width={40}
                color="#2563EB"
                ariaLabel="loading"
              />
            </div>
            Loading departments...
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏢</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No departments found
            </h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first department.
            </p>
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
                          disabled={actionLoading}
                          className="text-indigo-600 hover:text-indigo-900 mr-4 disabled:text-gray-400 flex items-center gap-1"
                        >
                          {actionLoading && (
                            <TailSpin height={16} width={16} color="#4F46E5" />
                          )}
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(department._id)}
                          disabled={actionLoading}
                          className="text-red-600 hover:text-red-900 disabled:text-gray-400 flex items-center gap-1"
                        >
                          {actionLoading && (
                            <TailSpin height={16} width={16} color="#DC2626" />
                          )}
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
                    disabled={actionLoading}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:text-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 font-medium"
                  >
                    {actionLoading ? (
                      <>
                        <TailSpin height={20} width={20} color="#FFFFFF" />
                        {editingDepartment ? "Updating..." : "Saving..."}
                      </>
                    ) : editingDepartment ? (
                      "Update Department"
                    ) : (
                      "Add Department"
                    )}
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
