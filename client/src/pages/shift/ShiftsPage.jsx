import React, { useState } from "react";
import { TailSpin } from "react-loader-spinner";
import ShiftModel from "./shiftModel";
import { 
  useGetallFunctionQuery, 
  useUpdateFunctionMutation 
} from "../../store/DynamicApi";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
} from "react-icons/fi";
import { HiStatusOnline } from "react-icons/hi";

const ShiftPage = () => {
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  
  // API Queries
  const {
    data: shiftData = {},
    isLoading,
    isError,
    refetch,
  } = useGetallFunctionQuery({ url: `/shifts?page=${currentPage}` });

  const [updateShift, { isLoading: isUpdating }] = useUpdateFunctionMutation();

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState(null);

  // Derived Data
  const shifts = shiftData?.shifts || [];
  const totalPages = shiftData?.pages || 1;
  const totalShifts = shiftData?.total || 0;
  console.log(totalShifts)

  // Helper Functions
  const computeDuration = (startTime, endTime) => {
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    let durationMinutes = endH * 60 + endM - (startH * 60 + startM);
    if (durationMinutes < 0) durationMinutes += 24 * 60;

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  // Prepare shifts with timeRange and totalHours
  const formattedShifts = shifts.map((shift) => ({
    ...shift,
    timeRange: `${shift.startTime} - ${shift.endTime}`,
    totalHours: computeDuration(shift.startTime, shift.endTime),
  }));

  const activeShifts = formattedShifts.filter(shift => shift.status === "Active").length;

  // Pagination Handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const generatePageNumbers = () => {
    const totalPages = shiftData.pages || 1;
    const current = currentPage;
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    let prev = 0;
    for (let i of range) {
      if (prev) {
        if (i - prev === 2) {
          rangeWithDots.push(prev + 1);
        } else if (i - prev !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      prev = i;
    }

    return rangeWithDots;
  };

  // Modal Handlers
  const openAddModal = () => {
    setEditingShift(null);
    setIsModalOpen(true);
  };

  const openEditModal = (shift) => {
    setEditingShift(shift);
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

  // Delete Handlers
  const openDeleteModal = (shift) => {
    setShiftToDelete(shift);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setShiftToDelete(null);
  };

  const handleDelete = async () => {
    if (!shiftToDelete) return;

    try {
      await updateShift({
        id: shiftToDelete._id,
        url: "shifts/delete",
      }).unwrap();

      console.log("Shift deleted successfully!");
      refetch();

      // Adjust pagination if last item on page was deleted
      if (shifts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting shift:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-8xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
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
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-400 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3 min-w-[180px]"
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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Shifts</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalShifts}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {currentPage === 1 ? 'Showing first 10' : `Page ${currentPage} of ${totalPages}`}
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
                <p className="text-sm font-medium text-gray-600">Active Shifts</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{activeShifts}</p>
                <p className="text-xs text-gray-500 mt-1">On this page</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <HiStatusOnline className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Page</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{currentPage}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <FiClock className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pages</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalPages}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <FiClock className="text-2xl text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Status Management: Error State */}
        {isError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
            <div className="w-2 h-8 bg-red-500 rounded-full"></div>
            <div>
              <p className="font-medium">Error loading shifts</p>
              <p className="text-sm">Please try again later</p>
            </div>
          </div>
        )}

        {/* Status Management: Loading State */}
        {isLoading && formattedShifts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="flex justify-center mb-4">
              <TailSpin height={50} width={50} color="#2563EB" ariaLabel="loading" />
            </div>
            <p className="text-gray-600 text-lg">Loading shifts...</p>
          </div>
        ) : (
          <>
            {/* Shifts Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Shift Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formattedShifts.map((shift) => (
                      <tr key={shift._id} className="hover:bg-gray-50 transition-all duration-200 group">
                        <td className="px-8 py-5">
                          <p className="text-gray-900 font-semibold text-lg">{shift.name}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-gray-700">{shift.timeRange}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-gray-700">{shift.totalHours}</p>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                              shift.status === "Active"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                shift.status === "Active" ? "bg-green-500" : "bg-red-500"
                              }`}
                            ></div>
                            {shift.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => openEditModal(shift)}
                              className="p-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200 group-hover:scale-110"
                              title="Edit Shift"
                            >
                              <FiEdit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(shift)}
                              disabled={isUpdating}
                              className="p-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 group-hover:scale-110 disabled:opacity-50"
                              title="Delete Shift"
                            >
                              {isUpdating ? (
                                <TailSpin height={16} width={16} color="#DC2626" />
                              ) : (
                                <FiTrash2 className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {formattedShifts.length === 0 && !isLoading && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <FiClock className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No shifts found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Get started by creating your first shift
                  </p>
                  <button
                    onClick={openAddModal}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
                  >
                    <FiPlus className="text-lg" />
                    Create First Shift
                  </button>
                </div>
              )}
            </div>

            {/* Pagination Management */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center justify-center mt-8 space-y-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-blue-600">{formattedShifts.length}</span> of{" "}
                  <span className="font-semibold text-blue-600">{totalShifts}</span> shifts
                  {" • "}Page{" "}
                  <span className="font-semibold text-blue-600">{currentPage}</span> of{" "}
                  <span className="font-semibold text-blue-600">{totalPages}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>

                  {generatePageNumbers().map((pageNum, index) => (
                    <button
                      key={index}
                      onClick={() => typeof pageNum === "number" && handlePageChange(pageNum)}
                      disabled={pageNum === "..."}
                      className={`
                        flex items-center justify-center w-10 h-10 rounded-lg font-medium transition-all duration-200
                        ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white shadow-md scale-105"
                            : pageNum === "..."
                            ? "text-gray-400 cursor-default"
                            : "text-gray-600 hover:bg-blue-50 hover:border hover:border-blue-200 hover:text-blue-600"
                        }
                      `}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Shift Modal */}
        <ShiftModel
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleShiftSaved}
          shift={editingShift}
        />

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-50 rounded-full">
                  <FiAlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Delete Shift</h3>
                  <p className="text-sm text-gray-500 mt-1">This action is permanent</p>
                </div>
              </div>

              <div className="my-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700">
                  Are you sure you want to delete the{" "}
                  <strong className="text-red-600">"{shiftToDelete?.name}"</strong> shift ({shiftToDelete?.timeRange})? 
                  This action cannot be undone and all associated data will be permanently removed.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeDeleteModal}
                  disabled={isUpdating}
                  className="px-5 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isUpdating}
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lg transform"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="w-4 h-4" />
                      Delete Shift
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftPage;