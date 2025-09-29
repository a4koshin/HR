import React, { useState, useEffect } from "react";
import {
  getAttendances,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from "../services/attendanceService";
import { getEmployees } from "../services/employeeService";
import { getShifts } from "../services/shiftService";

const AttendancePage = () => {
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [filter, setFilter] = useState({
    employee: "",
    date: new Date().toISOString().split("T")[0],
    shift: "",
  });

  const [formData, setFormData] = useState({
    employee: "",
    date: new Date().toISOString().split("T")[0],
    checkIn: "",
    checkOut: "",
    shift: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchAttendances();
    fetchEmployees();
    fetchShifts();
  }, []);

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      const attendancesData = await getAttendances();
      console.log("Fetched attendances:", attendancesData); // Debug log
      setAttendances(Array.isArray(attendancesData) ? attendancesData : []);
    } catch (err) {
      console.error("Error fetching attendances:", err);
      setError("Failed to fetch attendance records");
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const employeesData = await getEmployees();
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setEmployees([]);
    }
  };

  const fetchShifts = async () => {
    try {
      const shiftsData = await getShifts();
      setShifts(Array.isArray(shiftsData) ? shiftsData : []);
    } catch (err) {
      console.error("Error fetching shifts:", err);
      setShifts([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("Submitting form data:", formData); // Debug log

      // Format the data for submission
      const submissionData = {
        employee: formData.employee,
        date: formData.date,
        shift: formData.shift,
      };

      // Only include checkIn/checkOut if they have values
      if (formData.checkIn) {
        submissionData.checkIn = `${formData.date}T${formData.checkIn}`;
      }
      if (formData.checkOut) {
        submissionData.checkOut = `${formData.date}T${formData.checkOut}`;
      }

      console.log("Submission data:", submissionData); // Debug log

      let result;
      if (editingAttendance) {
        result = await updateAttendance(editingAttendance._id, submissionData);
        setAttendances((prev) =>
          prev.map((att) => (att._id === result._id ? result : att))
        );
        setSuccess("Attendance record updated successfully!");
      } else {
        result = await createAttendance(submissionData);
        setAttendances((prev) => [...prev, result]);
        setSuccess("Attendance record created successfully!");
      }

      console.log("Server response:", result); // Debug log

      resetForm();
      setIsModalOpen(false);
      // Refresh the list to ensure we have the latest data
      fetchAttendances();
    } catch (err) {
      console.error("Error saving attendance:", err);
      setError(
        err.response?.data?.message || "Failed to save attendance record"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (attendance) => {
    console.log("Editing attendance:", attendance); // Debug log
    setEditingAttendance(attendance);
    setFormData({
      employee: attendance.employee?._id || attendance.employee,
      date: attendance.date
        ? new Date(attendance.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      checkIn: attendance.checkIn
        ? new Date(attendance.checkIn).toTimeString().slice(0, 5)
        : "",
      checkOut: attendance.checkOut
        ? new Date(attendance.checkOut).toTimeString().slice(0, 5)
        : "",
      shift: attendance.shift?._id || attendance.shift,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this attendance record?")
    )
      return;

    try {
      setLoading(true);
      await deleteAttendance(id);
      setAttendances((prev) => prev.filter((att) => att._id !== id));
      setSuccess("Attendance record deleted successfully!");
    } catch (err) {
      console.error("Error deleting attendance:", err);
      setError(
        err.response?.data?.message || "Failed to delete attendance record"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employee: "",
      date: new Date().toISOString().split("T")[0],
      checkIn: "",
      checkOut: "",
      shift: "",
    });
    setEditingAttendance(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (error) {
      return "Invalid Time";
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (attendance) => {
    const status =
      attendance.status ||
      (attendance.checkIn && attendance.checkOut
        ? "Present"
        : attendance.checkIn
        ? "Present"
        : "Absent");

    const badgeStyles = {
      Present: "bg-green-100 text-green-800",
      Absent: "bg-red-100 text-red-800",
      Late: "bg-yellow-100 text-yellow-800",
      "Half-day": "bg-blue-100 text-blue-800",
    };

    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          badgeStyles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  // Safe filtering
  const filteredAttendances = Array.isArray(attendances)
    ? attendances.filter((attendance) => {
        if (!attendance) return false;

        const employeeMatch =
          filter.employee === "" ||
          attendance.employee?._id === filter.employee ||
          attendance.employee === filter.employee;

        const dateMatch =
          filter.date === "" ||
          (attendance.date &&
            new Date(attendance.date).toISOString().split("T")[0] ===
              filter.date);

        const shiftMatch =
          filter.shift === "" ||
          attendance.shift?._id === filter.shift ||
          attendance.shift === filter.shift;

        return employeeMatch && dateMatch && shiftMatch;
      })
    : [];

  // Calculate statistics safely
  const totalHours = filteredAttendances.reduce(
    (sum, att) => sum + (att.workedHours || 0),
    0
  );
  const presentCount = filteredAttendances.filter(
    (att) => att.status === "Present" || att.checkIn
  ).length;
  const absentCount = filteredAttendances.length - presentCount;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Attendance Management
            </h1>
            <p className="text-gray-600 mt-2">
              Track and manage employee attendance records
            </p>
          </div>
          <button
            onClick={openAddModal}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition duration-200"
          >
            {loading ? "Loading..." : "+ Add Attendance Record"}
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
            {success}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee
              </label>
              <select
                name="employee"
                value={filter.employee}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.fullname}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={filter.date}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shift
              </label>
              <select
                name="shift"
                value={filter.shift}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Shifts</option>
                {shifts.map((shift) => (
                  <option key={shift._id} value={shift._id}>
                    {shift.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalHours.toFixed(2)}h
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-2xl font-bold text-gray-900">
                  {presentCount}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {absentCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        {loading && attendances.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">⏳</div>
            <p className="text-gray-500">Loading attendance records...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shift
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Worked Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAttendances.map((att) => (
                    <tr key={att._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {att.employee?.fullname || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {att.employee?.position || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(att.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          {att.shift?.name || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {att.checkIn
                          ? formatTime(att.checkIn)
                          : "Not Checked In"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {att.checkOut
                          ? formatTime(att.checkOut)
                          : "Not Checked Out"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span
                          className={`font-semibold ${
                            att.workedHours ? "text-green-600" : "text-gray-400"
                          }`}
                        >
                          {att.workedHours ? `${att.workedHours}h` : "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(att)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(att)}
                          disabled={loading}
                          className="text-indigo-600 hover:text-indigo-900 mr-4 disabled:text-gray-400"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(att._id)}
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
        {!loading && filteredAttendances.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No attendance records found
            </h3>
            <p className="text-gray-500 mb-4">
              {attendances.length === 0
                ? "Get started by adding your first attendance record."
                : "No records match your current filters."}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Attendance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingAttendance
                  ? "Edit Attendance Record"
                  : "Add Attendance Record"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee *
                    </label>
                    <select
                      name="employee"
                      value={formData.employee}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Employee</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.fullname} - {emp.position}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shift *
                    </label>
                    <select
                      name="shift"
                      value={formData.shift}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Shift</option>
                      {shifts.map((shift) => (
                        <option key={shift._id} value={shift._id}>
                          {shift.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check In Time
                    </label>
                    <input
                      type="time"
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check Out Time
                    </label>
                    <input
                      type="time"
                      name="checkOut"
                      value={formData.checkOut}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 font-medium"
                  >
                    {loading
                      ? "Saving..."
                      : editingAttendance
                      ? "Update Record"
                      : "Add Record"}
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

export default AttendancePage;
