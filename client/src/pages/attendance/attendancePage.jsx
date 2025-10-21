import React, { useState } from "react";
import { TailSpin } from "react-loader-spinner";
import AttendanceModal from "./attendanceModel";
import { useGetallFunctionQuery } from "../../store/DynamicApi";
import { 
  FiEdit2, FiTrash2, FiPlus, FiUser, FiCalendar, FiClock, FiCheckCircle, FiXCircle 
} from "react-icons/fi";

const AttendancePage = () => {
  // Fetch attendance data
  const { data: attendanceData = [], isLoading, isError, refetch } =
    useGetallFunctionQuery({ url: "/attendance" });



  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);

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

  // Helpers
  // const attendanceRecords = attendanceData?.attendance || [];
  // console.log("Attendance Records:", attendanceRecords);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");
  const formatTime = (t) => (t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-");

  const getStatusBadge = (att) => {
    const statusConfig = {
      Present: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: FiCheckCircle },
      Absent: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: FiXCircle },
      Late: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: FiClock }
    };
    const config = statusConfig[att.status] || statusConfig.Absent;
    const IconComponent = config.icon;
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${config.bg} ${config.text} ${config.border}`}>
        <IconComponent className="w-4 h-4" />
        {att.status}
      </span>
    );
  };


  const attendanceRecords = attendanceData?.data || [];


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
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {attendanceRecords.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiClock className="text-2xl text-blue-600" />
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
                <TailSpin height={50} width={50} color="#2563EB" ariaLabel="loading" />
              </div>
              <p className="text-gray-600 text-lg">Loading attendance records...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Employee Details</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Date & Shift</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Time Tracking</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Worked Hours</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceRecords.map((att) => (
                    <tr key={att._id} className="hover:bg-gray-50 transition-all duration-200 group">
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                              {(att.employee?.fullname || "U").charAt(0)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-lg font-semibold text-gray-900 truncate">{att.employee?.fullname || "Unknown Employee"}</p>
                            <p className="text-gray-500 text-sm truncate">{att.employee?.position || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-900 font-medium">
                            <FiCalendar className="w-4 h-4 text-blue-600" />
                            {formatDate(att.date)}
                          </div>
                          <div className="text-sm text-gray-500">{att.shift?.name || "-"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <FiClock className="w-4 h-4 text-green-600" />
                            <span className="font-medium">In: {formatTime(att.checkIn)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <FiClock className="w-4 h-4 text-red-600" />
                            <span className="font-medium">Out: {formatTime(att.checkOut)}</span>
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
                            onClick={() => console.log("delete", att._id)}
                            className="p-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 group-hover:scale-110"
                            title="Delete Record"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        <AttendanceModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleAttendanceSaved}
          attendance={editingAttendance}
        />
      </div>
    </div>
  );
};

export default AttendancePage;
