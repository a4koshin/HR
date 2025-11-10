import React, { useState } from "react";
import { TailSpin } from "react-loader-spinner";
import LeaveModal from "../leave/leaveModel";
import { useGetallFunctionQuery } from "../../store/DynamicApi";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiCalendar,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const LeavePage = () => {
  // RTK Query hooks
  
  
  const [currentPage, setCurrentPage] = useState(1);
  const { 
    data: leavesData = {}, 
    isLoading: leavesLoading, 
    isError: leavesError,
    refetch: refetchLeaves 
  } = useGetallFunctionQuery({ url: `/leaves?page=${currentPage}` });


  const totalPages = leavesData?.pages || 1;
const totalRecords = leavesData?.total || 0;
// Add these functions
const handlePageChange = (page) => {
  setCurrentPage(page);
};

const generatePageNumbers = () => {
  const totalPages = leavesData.pages || 1;
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
  
  const { data: employeesData = {} } = useGetallFunctionQuery({ url: "/employees" });
  const { data: shiftsData = {} } = useGetallFunctionQuery({ url: "/shifts" });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);

  const leaves = leavesData.leaves || [];
  const employees = employeesData.employees || [];
  const shifts = shiftsData.shifts || [];

  // Open modal for adding or editing
  const openModal = (leave = null) => {
    setEditingLeave(leave);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingLeave(null);
    setIsModalOpen(false);
  };

  // Status counts
  const pendingLeaves = leaves.filter(leave => leave.status === "Pending").length;
  const approvedLeaves = leaves.filter(leave => leave.status === "Approved").length;
  const rejectedLeaves = leaves.filter(leave => leave.status === "Rejected").length;

  // Status and type badges
  const getStatusBadge = (status) => {
    const badgeStyles = { 
      Approved: "bg-green-50 text-green-700 border border-green-200", 
      Pending: "bg-yellow-50 text-yellow-700 border border-yellow-200", 
      Rejected: "bg-red-50 text-red-700 border border-red-200" 
    };
    
    const icons = {
      Approved: <FiCheckCircle className="w-3 h-3" />,
      Pending: <FiClock className="w-3 h-3" />,
      Rejected: <FiXCircle className="w-3 h-3" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${badgeStyles[status] || "bg-gray-50 text-gray-700 border border-gray-200"}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const badgeStyles = { 
      Sick: "bg-blue-50 text-blue-700 border border-blue-200", 
      Vacation: "bg-purple-50 text-purple-700 border border-purple-200", 
      Unpaid: "bg-orange-50 text-orange-700 border border-orange-200", 
      Other: "bg-gray-50 text-gray-700 border border-gray-200" 
    };
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeStyles[type] || "bg-gray-50 text-gray-700"}`}>
        {type}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  const handleDelete = async (leaveId) => {
    if (window.confirm("Are you sure you want to delete this leave application?")) {
      // Implement delete functionality here
      console.log("Delete leave:", leaveId);
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
                Leave Management
              </h1>
              <p className="text-gray-600 mt-3 text-lg">
                Manage employee leave applications and approvals efficiently
              </p>
            </div>
            <button
              onClick={() => openModal()}
              disabled={leavesLoading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-400 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3 min-w-[180px]"
            >
              {leavesLoading ? (
                <TailSpin height={20} width={20} color="#FFFFFF" />
              ) : (
                <>
                  <FiPlus className="text-xl" />
                  <span>Apply for Leave</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
  {/* Stats Cards */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">Total Leaves</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {totalRecords}
        </p>
      </div>
      <div className="p-3 bg-blue-100 rounded-xl">
        <FiCalendar className="text-2xl text-blue-600" />
      </div>
    </div>
  </div>

  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">Pending</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {pendingLeaves}
        </p>
      </div>
      <div className="p-3 bg-yellow-100 rounded-xl">
        <FiClock className="text-2xl text-yellow-600" />
      </div>
    </div>
  </div>

  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">Approved</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {approvedLeaves}
        </p>
      </div>
      <div className="p-3 bg-green-100 rounded-xl">
        <FiCheckCircle className="text-2xl text-green-600" />
      </div>
    </div>
  </div>

  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">Rejected</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {rejectedLeaves}
        </p>
      </div>
      <div className="p-3 bg-red-100 rounded-xl">
        <FiXCircle className="text-2xl text-red-600" />
      </div>
    </div>
  </div>
</div>

        {/* Error State */}
        {leavesError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
            <div className="w-2 h-8 bg-red-500 rounded-full"></div>
            <div>
              <p className="font-medium">Error loading leaves</p>
              <p className="text-sm">Please try again later</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {leavesLoading && leaves.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="flex justify-center mb-4">
              <TailSpin
                height={50}
                width={50}
                color="#2563EB"
                ariaLabel="loading"
              />
            </div>
            <p className="text-gray-600 text-lg">Loading leaves...</p>
          </div>
        ) : (
          // Leaves Table
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Employee & Leave Details
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Shift
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
                  {leaves.map((leave) => (
                    <tr
                      key={leave._id}
                      className="hover:bg-gray-50 transition-all duration-200 group cursor-pointer"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                              {leave.emp_id?.fullname?.charAt(0) || "U"}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-lg font-semibold text-gray-900 truncate">
                              {leave.emp_id?.fullname || "N/A"}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center gap-1 text-gray-500 text-sm">
                                {getTypeBadge(leave.type)}
                              </div>
                              {leave.reason && (
                                <div className="text-gray-500 text-sm truncate max-w-xs">
                                  {leave.reason}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-medium">
                            {formatDate(leave.startDate)}
                          </span>
                          <span className="text-gray-500 text-sm">
                            to {formatDate(leave.endDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-gray-900 font-semibold">
                          {leave.duration || "N/A"} day(s)
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <FiClock className="w-4 h-4" />
                          {leave.shift_id?.name || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(leave.status)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openModal(leave)}
                            className="p-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200 group-hover:scale-110"
                            title="Edit Leave"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(leave._id)}
                            className="p-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 group-hover:scale-110"
                            title="Delete Leave"
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

            {/* Empty State */}
            {leaves.length === 0 && !leavesLoading && (
              <div className="bg-white text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <FiCalendar className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No leave applications found
                </h3>
                <p className="text-gray-600 mb-6">
                  Get started by applying for your first leave
                </p>
                <button
                  onClick={() => openModal()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-200"
                >
                  Apply for Leave
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pagination - Clean & Beautiful */}
{totalPages > 1 && (
  <div className="flex flex-col items-center justify-center mt-8 space-y-4">
    {/* Page Info */}
    <div className="text-sm text-gray-600">
      Page <span className="font-semibold text-blue-600">{currentPage}</span> of{" "}
      <span className="font-semibold text-blue-600">{totalPages}</span>
    </div>

    {/* Pagination Controls */}
    <div className="flex items-center space-x-2">
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
      >
        <FiChevronLeft className="w-5 h-5" />
      </button>

      {/* Page Numbers */}
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

      {/* Next Button */}
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

        {/* Leave Modal */}
        {isModalOpen && (
            <LeaveModal
            isOpen={isModalOpen}
            onClose={closeModal}
            leave={editingLeave}
            employees={employees}
            shifts={shifts}
            refetchLeaves={refetchLeaves}
          />
        )}
      </div>
    </div>
  );
};

export default LeavePage;