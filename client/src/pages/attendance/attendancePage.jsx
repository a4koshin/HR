import React, { useState } from "react";
import { TailSpin } from "react-loader-spinner";
import AttendanceModal from "./attendanceModel";
import { 
  useGetallFunctionQuery, 
  useUpdateFunctionMutation 
} from "../../store/DynamicApi";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiUser,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
} from "react-icons/fi";

const AttendancePage = () => {
  // Fetch attendance data
  const [currentPage, setCurrentPage] = useState(1);
  const {
    data: attendanceData = {},
    isLoading,
    isError,
    refetch,
  } = useGetallFunctionQuery({ url: `/attendance?page=${currentPage}` });

  const [updateAttendance, { isLoading: isUpdating }] = useUpdateFunctionMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState(null);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const generatePageNumbers = () => {
    const totalPages = attendanceData.pages || 1;
    const current = currentPage;
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= current - delta && i <= current + delta)
      ) {
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

  const openAddModal = () => {
    setEditingAttendance(null);
    setIsModalOpen(true);
  };

  const openEditModal = (att) => {
    setEditingAttendance(att);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAttendance(null);
  };

  const handleAttendanceSaved = () => {
    closeModal();
    refetch();
  };

  // Open delete confirmation modal
  const openDeleteModal = (attendance) => {
    setAttendanceToDelete(attendance);
    setIsDeleteModalOpen(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setAttendanceToDelete(null);
  };

  // Handle attendance deletion
  const handleDelete = async () => {
    if (!attendanceToDelete) return;

    try {
      await updateAttendance({
        id: attendanceToDelete._id,
        url: "attendance/delete",
      }).unwrap();

      console.log("Attendance record deleted successfully!");
      refetch();

      // Adjust pagination if last item on page was deleted
      if (attendanceRecords.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting attendance record:", error);
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");
  const formatTime = (t) =>
    t
      ? new Date(t).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  const getStatusBadge = (att) => {
    const statusConfig = {
      Present: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        icon: FiCheckCircle,
      },
      Absent: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        icon: FiXCircle,
      },
      Late: {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-200",
        icon: FiClock,
      },
    };
    const config = statusConfig[att.status] || statusConfig.Absent;
    const IconComponent = config.icon;
    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${config.bg} ${config.text} ${config.border}`}
      >
        <IconComponent className="w-4 h-4" />
        {att.status}
      </span>
    );
  };

  const attendanceRecords = attendanceData?.attendances || [];
  const totalPages = attendanceData?.pages || 1;
  const totalRecords = attendanceData?.total || 0;

  // Calculate stats for the cards
  const presentCount = attendanceRecords.filter(att => att.status === "Present").length;
  const absentCount = attendanceRecords.filter(att => att.status === "Absent").length;
  const lateCount = attendanceRecords.filter(att => att.status === "Late").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-8xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-6 sm:mb-0">
            <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Attendance Management
            </h1>
            <p className="text-gray-600 mt-3 text-lg">
              Track and manage employee attendance records efficiently
            </p>
          </div>
          <button
            onClick={openAddModal}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3 min-w-[180px]"
          >
            {isLoading ? (
              <TailSpin height={20} width={20} color="#FFFFFF" />
            ) : (
              <>
                <FiPlus className="text-xl" />
                <span>Add Record</span>
              </>
            )}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Records
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalRecords}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiClock className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {presentCount}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <FiCheckCircle className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {absentCount}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <FiXCircle className="text-2xl text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Late</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {lateCount}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <FiClock className="text-2xl text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {isError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
            <div className="w-2 h-8 bg-red-500 rounded-full"></div>
            <div>
              <p className="font-medium">Error loading attendance records</p>
              <p className="text-sm">Please try again later</p>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {isLoading && attendanceRecords.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex justify-center mb-4">
                <TailSpin
                  height={50}
                  width={50}
                  color="#2563EB"
                  ariaLabel="loading"
                />
              </div>
              <p className="text-gray-600 text-lg">
                Loading attendance records...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Employee Details
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Date & Shift
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Time Tracking
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Worked Hours
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
                  {attendanceRecords.map((att) => (
                    <tr
                      key={att._id}
                      className="hover:bg-gray-50 transition-all duration-200 group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                              {(att.employee?.fullname || "U").charAt(0)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-lg font-semibold text-gray-900 truncate">
                              {att.employee?.fullname || "Unknown Employee"}
                            </p>
                            <p className="text-gray-500 text-sm truncate">
                              {att.employee?.position || "-"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-900 font-medium">
                            <FiCalendar className="w-4 h-4 text-blue-600" />
                            {formatDate(att.date)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {att.shift?.name || "-"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <FiClock className="w-4 h-4 text-green-600" />
                            <span className="font-medium">
                              In: {formatTime(att.checkIn)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <FiClock className="w-4 h-4 text-red-600" />
                            <span className="font-medium">
                              Out: {formatTime(att.checkOut)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                          <FiClock className="w-4 h-4 text-purple-600" />
                          {att.workedHours || 0}h
                        </div>
                      </td>
                      <td className="px-6 py-5">{getStatusBadge(att)}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(att)}
                            className="p-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200 group-hover:scale-110"
                            title="Edit Record"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(att)}
                            disabled={isUpdating}
                            className="p-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 group-hover:scale-110 disabled:opacity-50"
                            title="Delete Record"
                          >
                            {isUpdating ? (
                              <TailSpin
                                height={16}
                                width={16}
                                color="#DC2626"
                              />
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
          )}

          {/* Empty State */}
          {attendanceRecords.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FiClock className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No attendance records found
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by adding your first attendance record
              </p>
              <button
                onClick={openAddModal}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
              >
                <FiPlus className="text-lg" />
                Add First Record
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-center mt-8 space-y-4">
            <div className="text-sm text-gray-600">
              Page <span className="font-semibold text-blue-600">{currentPage}</span> of{" "}
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
                    ${currentPage === pageNum
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

        {/* Attendance Modal */}
        <AttendanceModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleAttendanceSaved}
          attendance={editingAttendance}
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
                  <h3 className="text-xl font-semibold text-gray-900">
                    Delete Attendance Record
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This action is permanent
                  </p>
                </div>
              </div>

              <div className="my-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700">
                  Are you sure you want to delete the attendance record for{" "}
                  <strong className="text-red-600">
                    {attendanceToDelete?.employee?.fullname || "Unknown Employee"}
                  </strong>{" "}
                  on{" "}
                  <strong className="text-red-600">
                    {formatDate(attendanceToDelete?.date)}
                  </strong>
                  ? This action cannot be undone.
                </p>
                {attendanceToDelete && (
                  <div className="mt-3 text-sm text-gray-600">
                    <p><strong>Status:</strong> {attendanceToDelete.status}</p>
                    <p><strong>Time:</strong> {formatTime(attendanceToDelete.checkIn)} - {formatTime(attendanceToDelete.checkOut)}</p>
                  </div>
                )}
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
                      Delete Record
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

export default AttendancePage;