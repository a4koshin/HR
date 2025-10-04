import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAttendances,
  fetchEmployees,
  fetchShifts,
  fetchEnums,
  addAttendance,
  editAttendance,
  removeAttendance,
  clearMessages,
} from "../slices/attendanceSlice";

import { TailSpin } from "react-loader-spinner";

const AttendancePage = () => {
  const dispatch = useDispatch();

  // Redux state
  const { attendances, employees, shifts, enums, loading, error, success } =
    useSelector((state) => state.attendance);

  // Local UI state
  const [filter, setFilter] = useState({ employee: "", date: "", shift: "" });
  const [formData, setFormData] = useState({
    employee: "",
    date: new Date().toISOString().split("T")[0],
    checkIn: "",
    checkOut: "",
    shift: "",
    status: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);

  // --- Utility Functions ---
  const calculateWorkedHours = (checkIn, checkOut, date) => {
    if (!checkIn || !checkOut) return 0;
    const [inHours, inMinutes] = checkIn.split(":").map(Number);
    const [outHours, outMinutes] = checkOut.split(":").map(Number);
    let inTime = new Date(date);
    inTime.setHours(inHours, inMinutes, 0, 0);
    let outTime = new Date(date);
    outTime.setHours(outHours, outMinutes, 0, 0);
    if (outTime < inTime) outTime.setDate(outTime.getDate() + 1);
    const diffMs = outTime - inTime;
    return parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      });
    } catch {
      return "Invalid Time";
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (attendance) => {
    const status =
      attendance?.status ||
      (attendance?.checkIn && attendance?.checkOut ? "Present" : "Absent");

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

  // --- Fetch on Mount ---
  useEffect(() => {
    dispatch(fetchAttendances());
    dispatch(fetchEmployees());
    dispatch(fetchShifts());
    dispatch(fetchEnums());
  }, [dispatch]);

  // --- Form Handling ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const workedHours = calculateWorkedHours(
      formData.checkIn,
      formData.checkOut,
      formData.date
    );

    // Prepare data for backend
    const submissionData = {
      employee: formData.employee,
      date: formData.date,
      shift: formData.shift,
      checkIn: formData.checkIn
        ? `${formData.date}T${formData.checkIn}:00.000Z`
        : null,
      checkOut: formData.checkOut
        ? `${formData.date}T${formData.checkOut}:00.000Z`
        : null,
      status: formData.status || "Absent",
      workedHours,
    };

    if (editingAttendance) {
      // Edit existing attendance
      dispatch(
        editAttendance({
          id: editingAttendance._id,
          attendance: submissionData,
        })
      )
        .unwrap()
        .then(() => {
          resetForm();
          setEditingAttendance(null);
          setIsModalOpen(false);
        })
        .catch((err) => {
          console.error("Update error:", err);
        });
    } else {
      // Create new attendance
      dispatch(addAttendance(submissionData))
        .unwrap()
        .then(() => {
          resetForm();
          setIsModalOpen(false);
        })
        .catch((err) => {
          console.error("Create error:", err);
        });
    }
  };

  const handleEdit = (attendance) => {
    setEditingAttendance(attendance);
    setFormData({
      employee: attendance.employee?._id || attendance.employee || "",
      date: attendance.date
        ? new Date(attendance.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      checkIn: attendance.checkIn
        ? new Date(attendance.checkIn).toISOString().substr(11, 5)
        : "",
      checkOut: attendance.checkOut
        ? new Date(attendance.checkOut).toISOString().substr(11, 5)
        : "",
      shift: attendance.shift?._id || attendance.shift || "",
      status: attendance.status || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (
      !window.confirm("Are you sure you want to delete this attendance record?")
    )
      return;
    dispatch(removeAttendance(id));
  };

  const resetForm = () => {
    setFormData({
      employee: "",
      date: new Date().toISOString().split("T")[0],
      checkIn: "",
      checkOut: "",
      shift: "",
      status: "",
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
    dispatch(clearMessages());
  };

  // --- Filtering & Stats ---
  const safeDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return isNaN(d) ? null : d.toISOString().split("T")[0];
  };

  const filteredAttendances = Array.isArray(attendances)
    ? attendances.filter((att) => {
        const empMatch =
          !filter.employee ||
          att.employee?._id === filter.employee ||
          att.employee === filter.employee;

        const dateMatch = !filter.date || safeDate(att.date) === filter.date;

        const shiftMatch =
          !filter.shift ||
          att.shift?._id === filter.shift ||
          att.shift === filter.shift;

        return empMatch && dateMatch && shiftMatch;
      })
    : [];

  const totalHours = filteredAttendances.reduce(
    (sum, att) => sum + (att?.workedHours ?? 0),
    0
  );

  const presentCount = filteredAttendances.filter(
    (att) => att?.status === "Present"
  ).length;

  const absentCount = filteredAttendances.filter(
    (att) => att?.status === "Absent"
  ).length;

  return (
    <div className="min-h-screen p-6">
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
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <TailSpin height={20} width={20} color="#FFFFFF" />
                Loading...
              </>
            ) : (
              "+ Add Attendance Record"
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
                    {emp.name || emp.fullname} - {emp.position || "-"}
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-700">Total Hours</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {totalHours.toFixed(2)}h
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-700">Present</h3>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {presentCount}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-700">Absent</h3>
            <p className="mt-2 text-2xl font-bold text-red-600">
              {absentCount}
            </p>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          {loading && filteredAttendances.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="flex justify-center mb-4">
                <TailSpin
                  height={40}
                  width={40}
                  color="#2563EB"
                  ariaLabel="loading"
                />
              </div>
              Loading attendance records...
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Shift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Worked Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendances
                  .filter((att) => att) // remove any undefined/null entries
                  .map((att) => {
                    const employee = att?.employee || {}; // fallback if employee missing
                    const shift = att?.shift || {};

                    return (
                      <tr key={att._id || Math.random()}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.fullname ||
                              employee.name ||
                              "Unknown Employee"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.position || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {att.date ? formatDate(att.date) : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {shift.name || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatTime(att.checkIn)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatTime(att.checkOut)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {att?.workedHours ?? 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(att)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(att)}
                            disabled={loading}
                            className="text-blue-600 hover:text-blue-900 mr-4 disabled:text-gray-400 flex items-center gap-1"
                          >
                            {loading && (
                              <TailSpin
                                height={16}
                                width={16}
                                color="#2563EB"
                              />
                            )}
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(att._id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-900 disabled:text-gray-400 flex items-center gap-1"
                          >
                            {loading && (
                              <TailSpin
                                height={16}
                                width={16}
                                color="#DC2626"
                              />
                            )}
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                {filteredAttendances.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
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
                          {emp.name || emp.fullname} - {emp.position || "-"}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Status</option>
                      {(Array.isArray(enums.status) ? enums.status : []).map(
                        (status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        )
                      )}
                    </select>
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
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 font-medium"
                  >
                    {loading ? (
                      <>
                        <TailSpin height={20} width={20} color="#FFFFFF" />
                        {editingAttendance ? "Updating..." : "Saving..."}
                      </>
                    ) : editingAttendance ? (
                      "Update Record"
                    ) : (
                      "Add Record"
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

export default AttendancePage;
