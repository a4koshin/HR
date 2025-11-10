import React, { useState, useEffect } from "react";
import { TailSpin } from "react-loader-spinner";
import ApplicantModel from "./ApplicantModel";
import { useGetallFunctionQuery } from "../../store/DynamicApi";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiUser,
  FiMail,
  FiBriefcase,
  FiCalendar,
  FiTrendingUp,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const ApplicantPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState(null);
  const [filter, setFilter] = useState({ status: "", job: "" });
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch applicants with pagination
  const {
    data: applicantsData,
    isLoading,
    isError,
    refetch,
  } = useGetallFunctionQuery({ url: `/applicants?page=${currentPage}` });

  // Fetch jobs for filter dropdown
  const { data: jobsData } = useGetallFunctionQuery({ url: "/recruitment" });

  // Pagination functions
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const generatePageNumbers = () => {
    const totalPages = applicantsData?.pages || 1;
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

  const handleOpenModal = (applicant = null) => {
    setEditingApplicant(applicant);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingApplicant(null);
    setIsModalOpen(false);
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const applicants = applicantsData?.applicants || [];
  const jobs = jobsData?.recruitments || jobsData?.jobs || [];

  // Calculate stats
  const totalApplicants = applicants.length;
  const appliedCount = applicants.filter(a => a.status === "applied").length;
  const interviewCount = applicants.filter(a => a.status === "interview").length;
  const hiredCount = applicants.filter(a => a.status === "hired").length;

  // Filter applicants
  const filteredApplicants = applicants.filter(applicant => {
    const statusMatch = !filter.status || applicant.status === filter.status;
    const jobMatch = !filter.job || applicant.appliedJob?._id === filter.job;
    return statusMatch && jobMatch;
  });

  const totalPages = applicantsData?.pages || 1;
  const totalRecords = applicantsData?.total || 0;

  // Updated getStatusBadge function with your exact style pattern
  const getStatusBadge = (status) => {
    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
          status === "hired"
            ? "bg-green-50 text-green-700 border border-green-200"
            : status === "interview"
            ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
            : status === "rejected"
            ? "bg-red-50 text-red-700 border border-red-200"
            : "bg-blue-50 text-blue-700 border border-blue-200"
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            status === "hired"
              ? "bg-green-500"
              : status === "interview"
              ? "bg-yellow-500"
              : status === "rejected"
              ? "bg-red-500"
              : "bg-blue-500"
          }`}
        ></div>
        {status === "applied" ? "Applied" : 
         status === "interview" ? "Interview" : 
         status === "hired" ? "Hired" : "Rejected"}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUser className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load applicants</h3>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-8xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-6 sm:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Applicant Tracking
              </h1>
              <p className="text-gray-600 mt-3 text-lg">
                Manage job applications, track candidate progress, and streamline hiring
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3 min-w-[180px]"
            >
              {isLoading ? (
                <TailSpin height={20} width={20} color="#FFFFFF" />
              ) : (
                <>
                  <FiPlus className="text-xl" />
                  <span>Add Applicant</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applicants</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalRecords}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiUser className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Applications</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{appliedCount}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiMail className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Interview Stage</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{interviewCount}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <FiCalendar className="text-2xl text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hired</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{hiredCount}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <FiTrendingUp className="text-2xl text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiFilter className="w-5 h-5 text-blue-600" />
            Filter Applicants
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FiUser className="w-4 h-4 text-blue-600" />
                Status
              </label>
              <select
                name="status"
                value={filter.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option value="">All Status</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FiBriefcase className="w-4 h-4 text-blue-600" />
                Job Position
              </label>
              <select
                name="job"
                value={filter.job}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option value="">All Jobs</option>
                {jobs.map(job => (
                  <option key={job._id} value={job._id}>
                    {job.title || job.jobTitle}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="flex justify-center mb-4">
              <TailSpin height={50} width={50} color="#2563EB" ariaLabel="loading" />
            </div>
            <p className="text-gray-600 text-lg">Loading applicants...</p>
          </div>
        ) : (
          /* Applicants Table */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Applicant Details
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Applied For
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Application Date
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
                  {filteredApplicants.map((applicant) => (
                    <tr key={applicant._id} className="hover:bg-gray-50 transition-all duration-200 group">
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                              {applicant.name?.charAt(0) || "A"}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-lg font-semibold text-gray-900 truncate">
                              {applicant.name}
                            </p>
                            <p className="text-gray-500 text-sm truncate flex items-center gap-1 mt-1">
                              <FiMail className="w-4 h-4" />
                              {applicant.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <p className="text-gray-900 font-medium">
                            {applicant.appliedJob?.title || applicant.appliedJob?.jobTitle || "N/A"}
                          </p>
                          {applicant.appliedJob?.department && (
                            <p className="text-sm text-gray-500">
                              {applicant.appliedJob.department}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <FiCalendar className="w-4 h-4 text-gray-400" />
                          {formatDate(applicant.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(applicant.status)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(applicant)}
                            className="p-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200 group-hover:scale-110"
                            title="Edit Applicant"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => console.log("Delete applicant", applicant._id)}
                            className="p-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 group-hover:scale-110"
                            title="Delete Applicant"
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
            {filteredApplicants.length === 0 && !isLoading && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <FiUser className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No applicants found</h3>
                <p className="text-gray-600 mb-6">Get started by adding your first applicant</p>
                <button
                  onClick={() => handleOpenModal()}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
                >
                  <FiPlus className="text-lg" />
                  Add First Applicant
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

        {/* Applicant Modal */}
        {isModalOpen && (
          <ApplicantModel
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            applicant={editingApplicant}
            onSave={() => {
              refetch();
              handleCloseModal();
            }}
            jobs={jobs}
          />
        )}
      </div>
    </div>
  );
};

export default ApplicantPage;