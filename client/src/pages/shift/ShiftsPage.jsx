import React, { useState } from "react";
import { TailSpin } from "react-loader-spinner";
import ShiftModel from "./shiftModel";
import { useGetallFunctionQuery } from "../../store/DynamicApi";
import { FiEdit2, FiTrash2, FiPlus, FiClock } from "react-icons/fi";
import { HiStatusOnline } from "react-icons/hi";

const ShiftPage = () => {
<<<<<<< HEAD
  const {
    data: shiftData = {},
    isLoading,
    isError,
    refetch,
  } = useGetallFunctionQuery({ url: "/shifts" });

=======
  const { data: shiftData = {}, isLoading, isError, refetch } = useGetallFunctionQuery({ url: "/shifts" });
>>>>>>> origin/main
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);

  const openAddModal = () => {
    setEditingShift(null);
    setIsModalOpen(true);
  };

  // ✅ Fixed: Parse timeRange or ISO strings before passing to modal
  const openEditModal = (shift) => {
    let startTime = "";
    let endTime = "";

    if (shift.timeRange && shift.timeRange.includes(" - ")) {
      const [start, end] = shift.timeRange.split(" - ");
      startTime = start.trim();
      endTime = end.trim();
    } else {
      startTime = shift.startTime
        ? new Date(shift.startTime).toISOString().substring(11, 16)
        : "";
      endTime = shift.endTime
        ? new Date(shift.endTime).toISOString().substring(11, 16)
        : "";
    }

    setEditingShift({
      ...shift,
      startTime,
      endTime,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingShift(null);
  };

  const handleShiftSaved = () => {
    closeModal();
    refetch();
  };

  const shifts = shiftData.shifts || [];

  // Helper function to compute duration
  const computeDuration = (startTime, endTime) => {
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    let durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (durationMinutes < 0) durationMinutes += 24 * 60; // handle overnight shifts

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  // Prepare shifts with timeRange and totalHours
  const formattedShifts = shifts.map(s => ({
    ...s,
    timeRange: `${s.startTime} - ${s.endTime}`,
    totalHours: computeDuration(s.startTime, s.endTime)
  }));

  const totalShifts = formattedShifts.length;
  const activeShifts = formattedShifts.filter((s) => s.status === "Active").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-8xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-6 sm:mb-0">
            <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Shift Management
            </h1>
            <p className="text-gray-600 mt-3 text-lg">
              Manage and track employee shifts efficiently
            </p>
          </div>
          <button
            onClick={openAddModal}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-400 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-lg flex items-center justify-center gap-3 min-w-[180px]"
          >
            {isLoading ? (
              <TailSpin height={20} width={20} color="#FFFFFF" />
            ) : (
              <>
                <FiPlus className="text-xl" />
                <span>Add Shift</span>
              </>
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Shifts
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalShifts}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiClock className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {activeShifts}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <HiStatusOnline className="text-2xl text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        {isError && <p className="text-red-500">Error loading shifts</p>}

<<<<<<< HEAD
        {/* Table */}
        {!isLoading && (
=======
        {isLoading && formattedShifts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <TailSpin height={50} width={50} color="#2563EB" />
            <p className="text-gray-600 text-lg mt-4">Loading shifts...</p>
          </div>
        ) : (
>>>>>>> origin/main
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
<<<<<<< HEAD
                    <th className="px-8 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Shift Name
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-center">
                  {shifts.map((shift) => (
                    <tr
                      key={shift._id}
                      className="hover:bg-gray-50 transition-all duration-200 group cursor-pointer"
                    >
                      <td className="px-8 py-5 text-gray-900 font-semibold">
                        {shift.name}
                      </td>
                      <td className="px-6 py-5 text-gray-700">
                        {shift.timeRange}
                      </td>
                      <td className="px-6 py-5 text-gray-700">
                        {shift.totalHours}
                      </td>
=======
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Shift Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-left">
                  {formattedShifts.map((shift) => (
                    <tr key={shift._id} className="hover:bg-gray-50 transition-all duration-200 group cursor-pointer">
                      <td className="px-8 py-5 text-gray-900 font-semibold">{shift.name}</td>
                      <td className="px-6 py-5 text-gray-700">{shift.timeRange}</td>
                      <td className="px-6 py-5 text-gray-700">{shift.totalHours}</td>
>>>>>>> origin/main
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${
                            shift.status === "Active"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              shift.status === "Active"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                          {shift.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 flex gap-3">
                        <button onClick={() => openEditModal(shift)} className="p-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200" title="Edit Shift">
                          <FiEdit2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => console.log("Delete shift")} className="p-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200" title="Delete Shift">
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
<<<<<<< HEAD

              {shifts.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <FiClock className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No shifts found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Get started by adding your first shift
                  </p>
                  <button
                    onClick={openAddModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-200"
                  >
                    Add First Shift
                  </button>
                </div>
              )}
=======
>>>>>>> origin/main
            </div>
          </div>
        )}

        <ShiftModel isOpen={isModalOpen} onClose={closeModal} onSave={handleShiftSaved} shift={editingShift} />
      </div>
    </div>
  );
};

export default ShiftPage;
