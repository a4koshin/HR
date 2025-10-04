// components/ShiftPage.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { TailSpin } from "react-loader-spinner";
import {
  fetchShifts,
  addShift,
  editShift,
  removeShift,
  clearError,
  clearSuccess,
} from "../slices/shiftSlice";
import { getEmployees } from "../services/employeeService";

const ShiftPage = () => {
  const dispatch = useDispatch();
  const { shifts, loading, error, success } = useSelector(
    (state) => state.shifts
  );

  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
    assignedEmployees: [],
  });

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchShifts());
    fetchEmployeesData();
  }, [dispatch]);

  // Clear messages after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const fetchEmployeesData = async () => {
    try {
      const data = await getEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // Utility functions
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return "Invalid Time";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return "Invalid Date";
    }
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmployeeSelection = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prev) => ({ ...prev, assignedEmployees: selectedOptions }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const shiftData = {
      ...formData,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
    };

    if (editingShift) {
      dispatch(editShift({ id: editingShift._id, shiftData }));
    } else {
      dispatch(addShift(shiftData));
    }

    if (!error) {
      resetForm();
      setIsModalOpen(false);
    }
  };

  const handleEdit = (shift) => {
    setEditingShift(shift);
    setFormData({
      name: shift.name || "",
      startTime: shift.startTime
        ? new Date(shift.startTime).toISOString().slice(0, 16)
        : "",
      endTime: shift.endTime
        ? new Date(shift.endTime).toISOString().slice(0, 16)
        : "",
      assignedEmployees:
        shift.assignedEmployees?.map((emp) =>
          typeof emp === "string" ? emp : emp._id
        ) || [],
    });
    setViewMode(false);
    setIsModalOpen(true);
  };

  const handleView = (shift) => {
    setEditingShift(shift);
    setViewMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = (shiftId) => {
    if (window.confirm("Are you sure you want to delete this shift?")) {
      dispatch(removeShift(shiftId));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      startTime: "",
      endTime: "",
      assignedEmployees: [],
    });
    setEditingShift(null);
    setViewMode(false);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Calculate statistics
  const totalShifts = shifts.length;
  const totalEmployees = shifts.reduce(
    (sum, shift) => sum + (shift.assignedEmployees?.length || 0),
    0
  );
  const averageAttendance =
    shifts.length > 0
      ? shifts.reduce(
          (sum, shift) => sum + (shift.attendanceStats?.attendanceRate || 0),
          0
        ) / shifts.length
      : 0;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Shift Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and track employee shifts
            </p>
          </div>
          <button
            onClick={openAddModal}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <TailSpin height={20} width={20} color="#FFFFFF" />
                Loading...
              </>
            ) : (
              "+ Add Shift"
            )}
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            Operation completed successfully!
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-700">
              Total Shifts
            </h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {totalShifts}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-700">
              Total Employees
            </h3>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {totalEmployees}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-700">
              Avg Attendance
            </h3>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {averageAttendance.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Shifts Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          {loading && shifts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="flex justify-center mb-4">
                <TailSpin
                  height={40}
                  width={40}
                  color="#2563EB"
                  ariaLabel="loading"
                />
              </div>
              Loading shifts...
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Shift Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Assigned Employees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Attendance Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shifts.map((shift) => (
                  <tr key={shift._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {shift.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatTime(shift.startTime)} -{" "}
                        {formatTime(shift.endTime)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDateTime(shift.startTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {shift.totalHours} hours
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {shift.assignedEmployees?.length || 0} employees
                      </div>
                      <div className="text-sm text-gray-500">
                        {shift.assignedEmployees
                          ?.slice(0, 2)
                          .map((emp) =>
                            typeof emp === "string" ? "Unknown" : emp.fullname
                          )
                          .join(", ")}
                        {shift.assignedEmployees?.length > 2 && "..."}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {shift.attendanceStats?.attendanceRate || 0}%
                      </div>
                      <div className="text-sm text-gray-500">
                        {shift.attendanceStats?.presentCount || 0}/
                        {shift.attendanceStats?.totalEmployees || 0} present
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleView(shift)}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-900 mr-4 disabled:text-gray-400 flex items-center gap-1"
                      >
                        {loading && (
                          <TailSpin height={16} width={16} color="#2563EB" />
                        )}
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(shift)}
                        disabled={loading}
                        className="text-green-600 hover:text-green-900 mr-4 disabled:text-gray-400 flex items-center gap-1"
                      >
                        {loading && (
                          <TailSpin height={16} width={16} color="#059669" />
                        )}
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(shift._id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-900 disabled:text-gray-400 flex items-center gap-1"
                      >
                        {loading && (
                          <TailSpin height={16} width={16} color="#DC2626" />
                        )}
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {shifts.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No shifts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit/View Shift Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {viewMode
                  ? "View Shift"
                  : editingShift
                  ? "Edit Shift"
                  : "Add Shift"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shift Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={viewMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time *
                      </label>
                      <input
                        type="datetime-local"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        required
                        disabled={viewMode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time *
                      </label>
                      <input
                        type="datetime-local"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        required
                        disabled={viewMode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned Employees
                    </label>
                    <select
                      multiple
                      name="assignedEmployees"
                      value={formData.assignedEmployees}
                      onChange={handleEmployeeSelection}
                      disabled={viewMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                    >
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.fullname} - {emp.position} ({emp.department})
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                      Hold Ctrl/Cmd to select multiple employees
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={loading}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:text-gray-400"
                  >
                    Cancel
                  </button>
                  {!viewMode && (
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 font-medium"
                    >
                      {loading ? (
                        <>
                          <TailSpin height={20} width={20} color="#FFFFFF" />
                          {editingShift ? "Updating..." : "Saving..."}
                        </>
                      ) : editingShift ? (
                        "Update Shift"
                      ) : (
                        "Add Shift"
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftPage;
