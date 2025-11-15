import React, { useState } from "react";
import { TailSpin } from "react-loader-spinner";
import TrainingModel from "./TrainingModel";
import { 
  useGetallFunctionQuery, 
  useUpdateFunctionMutation 
} from "../../store/DynamicApi";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiUsers,
  FiCalendar,
  FiClock,
  FiTrendingUp,
  FiFilter,
  FiUserCheck,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
} from "react-icons/fi";
import { toast } from "react-toastify";

const TrainingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [filter, setFilter] = useState({ status: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [trainingToDelete, setTrainingToDelete] = useState(null);

  const {
    data: trainingData,
    isLoading,
    isError,
    refetch,
  } = useGetallFunctionQuery({ url: `/trainings?page=${currentPage}` });

  const [updateTraining, { isLoading: isUpdating }] = useUpdateFunctionMutation();

  // --- Using EmployeePage pattern for pagination ---
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const generatePageNumbers = () => {
    const totalPages = trainingData.pages || 1;
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

  const handleOpenModal = (training = null) => {
    setEditingTraining(training);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTraining(null);
    setIsModalOpen(false);
  };

  // --- Using EmployeePage pattern for delete functionality ---
  const openDeleteModal = (training) => {
    setTrainingToDelete(training);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTrainingToDelete(null);
  };

  const handleDelete = async () => {
    if (!trainingToDelete) return;

    try {
      await updateTraining({
        id: trainingToDelete._id,
        url: "trainings/delete",
      }).unwrap();

      toast.success("Training program deleted successfully!");
      refetch();

      // Using the same pattern as EmployeePage but with trainings
      if (trainings.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting training program:", error);
      toast.error("Failed to delete training program");
    }
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const trainings = trainingData?.trainings || trainingData || [];

  // Calculate stats
  const totalTrainings = trainings.length;
  const notStartedCount = trainings.filter(t => t.completionStatus === "Not Started").length;
  const inProgressCount = trainings.filter(t => t.completionStatus === "In Progress").length;
  const completedCount = trainings.filter(t => t.completionStatus === "Completed").length;
  const totalParticipants = trainings.reduce((sum, training) => sum + (training.participants?.length || 0), 0);

  // Filter trainings
  const filteredTrainings = trainings.filter(training => {
    return !filter.status || training.completionStatus === filter.status;
  });

  const totalPages = trainingData?.pages || 1;
  const totalRecords = trainingData?.total || 0;

  // Updated getStatusBadge function with your exact style pattern
  const getStatusBadge = (status) => {
    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
          status === "Completed"
            ? "bg-green-50 text-green-700 border border-green-200"
            : status === "In Progress"
            ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
            : "bg-gray-50 text-gray-700 border border-gray-200"
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            status === "Completed"
              ? "bg-green-500"
              : status === "In Progress"
              ? "bg-yellow-500"
              : "bg-gray-500"
          }`}
        ></div>
        {status}
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

  const getDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  const isUpcoming = (startDate) => {
    return new Date(startDate) > new Date();
  };

  const isOngoing = (startDate, endDate) => {
    const now = new Date();
    return new Date(startDate) <= now && new Date(endDate) >= now;
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUsers className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load training programs</h3>
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
                Training Programs
              </h1>
              <p className="text-gray-600 mt-3 text-lg">
                Organize employee training sessions, track progress, and develop your team
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
                  <span>Create Training</span>
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
                <p className="text-sm font-medium text-gray-600">Total Trainings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalRecords}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiUsers className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Not Started</p>
                <p className="text-3xl font-bold text-gray-600 mt-2">{notStartedCount}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-xl">
                <FiClock className="text-2xl text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{inProgressCount}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <FiTrendingUp className="text-2xl text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{totalParticipants}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <FiUserCheck className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiFilter className="w-5 h-5 text-blue-600" />
            Filter Trainings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FiClock className="w-4 h-4 text-blue-600" />
                Status
              </label>
              <select
                name="status"
                value={filter.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option value="">All Status</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
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
            <p className="text-gray-600 text-lg">Loading training programs...</p>
          </div>
        ) : (
          /* Trainings Table */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Training Details
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Schedule & Duration
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Participants
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
                  {filteredTrainings.map((training) => (
                    <tr key={training._id} className="hover:bg-gray-50 transition-all duration-200 group">
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                              <FiUsers className="w-6 h-6" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-lg font-semibold text-gray-900 truncate">
                              {training.title}
                            </p>
                           
                            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                              <FiUserCheck className="w-4 h-4" />
                              Trainer: {training.trainer}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <FiCalendar className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">{formatDate(training.startDate)}</span>
                            <span className="text-gray-400">→</span>
                            <span className="font-medium">{formatDate(training.endDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <FiClock className="w-4 h-4" />
                            {getDuration(training.startDate, training.endDate)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-900 font-semibold">
                            <FiUsers className="w-4 h-4 text-purple-600" />
                            {training.participants?.length || 0} employees
                          </div>
                          {training.participants && training.participants.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {training.participants.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{training.participants.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(training.completionStatus)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(training)}
                            className="p-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200 group-hover:scale-110"
                            title="Edit Training"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(training)}
                            disabled={isUpdating}
                            className="p-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 group-hover:scale-110 disabled:opacity-50"
                            title="Delete Training"
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
            {filteredTrainings.length === 0 && !isLoading && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <FiUsers className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No training programs found</h3>
                <p className="text-gray-600 mb-6">Get started by creating your first training program</p>
                <button
                  onClick={() => handleOpenModal()}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
                >
                  <FiPlus className="text-lg" />
                  Create First Training
                </button>
              </div>
            )}
          </div>
        )}

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

        {/* Training Modal */}
        {isModalOpen && (
          <TrainingModel
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            training={editingTraining}
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
                    Delete Training Program
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This action is permanent
                  </p>
                </div>
              </div>

              <div className="my-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700">
                  Are you sure you want to delete the training program{" "}
                  <strong className="text-red-600">
                    "{trainingToDelete?.title}"
                  </strong>
                  ? This action cannot be undone and all associated data will be
                  permanently removed.
                </p>
                {trainingToDelete && (
                  <div className="mt-3 text-sm text-gray-600">
                    <p><strong>Trainer:</strong> {trainingToDelete.trainer}</p>
                    <p><strong>Duration:</strong> {getDuration(trainingToDelete.startDate, trainingToDelete.endDate)}</p>
                    <p><strong>Participants:</strong> {trainingToDelete.participants?.length || 0} employees</p>
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
                      Delete Training
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

export default TrainingPage;