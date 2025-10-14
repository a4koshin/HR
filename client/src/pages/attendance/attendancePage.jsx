import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";


import { TailSpin } from "react-loader-spinner";

const AttendancePage = () => {

    

  return (
    <div className="min-h-screen">
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

    </div>
  );
};

export default AttendancePage;
