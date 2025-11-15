import React, { useState } from "react";
import { TailSpin } from "react-loader-spinner";
import RecruitmentModel from "./RecruitmentModel";
import { 
  useGetallFunctionQuery, 
  useUpdateFunctionMutation 
} from "../../store/DynamicApi";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiBriefcase,
  FiUsers,
  FiUserCheck,
  FiClock,
  FiTrendingUp,
  FiFilter,
  FiUserPlus,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
} from "react-icons/fi";
import { toast } from "react-toastify";

const RecruitmentPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecruitment, setEditingRecruitment] = useState(null);
  const [filter, setFilter] = useState({ status: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recruitmentToDelete, setRecruitmentToDelete] = useState(null);

  const {
    data: recruitmentData,
    isLoading,
    isError,
    refetch,
  } = useGetallFunctionQuery({ url: `/recruitment?page=${currentPage}` });

  const [updateRecruitment, { isLoading: isUpdating }] = useUpdateFunctionMutation();

  // --- Using EmployeePage pattern for pagination ---
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const generatePageNumbers = () => {
    const totalPages = recruitmentData.pages || 1;
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

  const handleOpenModal = (recruitment = null) => {
    setEditingRecruitment(recruitment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingRecruitment(null);
    setIsModalOpen(false);
  };

  // --- Using EmployeePage pattern for delete functionality ---
  const openDeleteModal = (recruitment) => {
    setRecruitmentToDelete(recruitment);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setRecruitmentToDelete(null);
  };

  const handleDelete = async () => {
    if (!recruitmentToDelete) return;

    try {
      await updateRecruitment({
        id: recruitmentToDelete._id,
        url: "recruitment/delete",
      }).unwrap();

      toast.success("Job position deleted successfully!");
      refetch();

      // Using the same pattern as EmployeePage but with recruitments
      if (recruitments.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting job position:", error);
      toast.error("Failed to delete job position");
    }
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleHireApplicant = async (jobId, applicantId) => {
    if (!window.confirm("Are you sure you want to hire this applicant?"))
      return;

    try {
      // This would call your hireApplicant API endpoint
      console.log("Hiring applicant:", applicantId, "for job:", jobId);
      // await hireApplicantFunction({ url: `/recruitment/${jobId}/hire`, formData: { applicantId } }).unwrap();
      refetch();
    } catch (error) {
      console.error("Hire failed:", error);
      alert("Failed to hire applicant");
    }
  };

  const recruitments =
    recruitmentData?.recruitments ||
    recruitmentData?.jobs ||
    (Array.isArray(recruitmentData) ? recruitmentData : []);

  const totalPages = recruitmentData?.pages || 1;
  const totalRecords = recruitmentData?.total || 0;

  // Calculate stats
  const totalJobs = recruitments.length;
  const openJobs = recruitments.filter((job) => job.status === "open").length;
  const closedJobs = recruitments.filter(
    (job) => job.status === "closed"
  ).length;
  const hiredJobs = recruitments.filter((job) => job.status === "hired").length;
  const totalApplicants = recruitments.reduce(
    (sum, job) => sum + (job.applicants?.length || 0),
    0
  );

  // Filter jobs
  const filteredRecruitments = recruitments.filter((job) => {
    return !filter.status || job.status === filter.status;
  });

  // Updated getStatusBadge function with your exact style pattern
  const getStatusBadge = (status) => {
    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
          status === "open"
            ? "bg-green-50 text-green-700 border border-green-200"
            : status === "closed"
            ? "bg-red-50 text-red-700 border border-red-200"
            : "bg-blue-50 text-blue-700 border border-blue-200"
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            status === "open"
              ? "bg-green-500"
              : status === "closed"
              ? "bg-red-500"
              : "bg-blue-500"
          }`}
        ></div>
        {status === "open" ? "Open" : status === "closed" ? "Closed" : "Hired"}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiBriefcase className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load job positions
          </h3>
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
                Job Positions
              </h1>
              <p className="text-gray-600 mt-3 text-lg">
                Manage job openings, track applicants, and hire talented
                candidates
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
                  <span>Create Job</span>
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
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalRecords}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiBriefcase className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Open Positions
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {openJobs}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <FiTrendingUp className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Applicants
                </p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {totalApplicants}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <FiUsers className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Successful Hires
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {hiredJobs}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiUserCheck className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiFilter className="w-5 h-5 text-blue-600" />
            Filter Jobs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FiClock className="w-4 h-4 text-blue-600" />
                Job Status
              </label>
              <select
                name="status"
                value={filter.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="hired">Hired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="flex justify-center mb-4">
              <TailSpin
                height={50}
                width={50}
                color="#2563EB"
                ariaLabel="loading"
              />
            </div>
            <p className="text-gray-600 text-lg">Loading job positions...</p>
          </div>
        ) : (
          /* Jobs Table */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Job Details
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Applicants
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Created Date
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
                  {filteredRecruitments.map((job) => (
                    <tr
                      key={job._id}
                      className="hover:bg-gray-50 transition-all duration-200 group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                              <FiBriefcase className="w-6 h-6" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-lg font-semibold text-gray-900 truncate">
                              {job.jobTitle}
                            </p>
                            <p className="text-gray-500 text-sm line-clamp-2 mt-1">
                              {job.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-900 font-semibold">
                            <FiUsers className="w-4 h-4 text-purple-600" />
                            {job.applicants?.length || 0} applicants
                          </div>
                          {job.applicants && job.applicants.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {job.applicants.slice(0, 3).map((applicant) => (
                                <div
                                  key={applicant._id}
                                  className="flex items-center gap-1"
                                >
                                  <button
                                    onClick={() =>
                                      handleHireApplicant(
                                        job._id,
                                        applicant._id
                                      )
                                    }
                                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg hover:bg-green-200 transition duration-200 flex items-center gap-1"
                                    title="Hire this applicant"
                                  >
                                    <FiUserPlus className="w-3 h-3" />
                                    Hire
                                  </button>
                                </div>
                              ))}
                              {job.applicants.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{job.applicants.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <FiClock className="w-4 h-4 text-gray-400" />
                          {formatDate(job.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(job.status)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(job)}
                            className="p-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200 group-hover:scale-110"
                            title="Edit Job"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(job)}
                            disabled={isUpdating}
                            className="p-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 group-hover:scale-110 disabled:opacity-50"
                            title="Delete Job"
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

            {/* Empty State */}
            {filteredRecruitments.length === 0 && !isLoading && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <FiBriefcase className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No job positions found
                </h3>
                <p className="text-gray-600 mb-6">
                  Get started by creating your first job opening
                </p>
                <button
                  onClick={() => handleOpenModal()}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
                >
                  <FiPlus className="text-lg" />
                  Create First Job
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-center mt-8 space-y-4">
            <div className="text-sm text-gray-600">
              Page{" "}
              <span className="font-semibold text-blue-600">{currentPage}</span>{" "}
              of{" "}
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
                  onClick={() =>
                    typeof pageNum === "number" && handlePageChange(pageNum)
                  }
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

        {/* Recruitment Modal */}
        {isModalOpen && (
          <RecruitmentModel
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            recruitment={editingRecruitment}
            onSave={() => {
              refetch();
              handleCloseModal();
            }}
          />
        )}

        {/* Delete Confirmation Modal - Using EmployeePage pattern */}
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
                    Delete Job Position
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This action is permanent
                  </p>
                </div>
              </div>

              <div className="my-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700">
                  Are you sure you want to delete the job position{" "}
                  <strong className="text-red-600">
                    "{recruitmentToDelete?.jobTitle}"
                  </strong>
                  ? This action cannot be undone and all associated data will be
                  permanently removed.
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
                      Delete Job
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

export default RecruitmentPage;