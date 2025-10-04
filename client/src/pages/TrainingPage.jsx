import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { TailSpin } from "react-loader-spinner";
import {
  fetchTrainings,
  createTrainingAsync,
  updateTrainingAsync,
  deleteTrainingAsync,
  clearMessages,
} from "../slices/trainingSlice";
import { fetchEmployees } from "../slices/employeeSlice";

const TrainingPage = () => {
  const dispatch = useDispatch();
  const {
    trainings = [],
    loading = false,
    error = null,
    success = null,
  } = useSelector((state) => state.training || {});
  const { employees = [] } = useSelector((state) => state.employee || {});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    trainer: "",
    startDate: "",
    endDate: "",
    participants: [],
    completionStatus: "Not Started",
  });

  useEffect(() => {
    dispatch(fetchTrainings());
    dispatch(fetchEmployees());
  }, [dispatch]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success, dispatch]);

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (status) => {
    const badgeStyles = {
      Completed: "bg-green-100 text-green-800",
      "In Progress": "bg-blue-100 text-blue-800",
      "Not Started": "bg-gray-100 text-gray-800",
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

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleParticipantSelection = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prev) => ({ ...prev, participants: selectedOptions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTraining) {
        await dispatch(
          updateTrainingAsync({ id: editingTraining._id, data: formData })
        ).unwrap();
      } else {
        await dispatch(createTrainingAsync(formData)).unwrap();
      }
      closeModal();
    } catch (err) {
      console.error("Error saving training:", err);
    }
  };

  const handleEdit = (training) => {
    setEditingTraining(training);
    setFormData({
      title: training.title || "",
      description: training.description || "",
      trainer: training.trainer || "",
      startDate: training.startDate
        ? new Date(training.startDate).toISOString().split("T")[0]
        : "",
      endDate: training.endDate
        ? new Date(training.endDate).toISOString().split("T")[0]
        : "",
      participants:
        training.participants?.map((emp) =>
          typeof emp === "string" ? emp : emp._id
        ) || [],
      completionStatus: training.completionStatus || "Not Started",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this training?"))
      return;
    try {
      await dispatch(deleteTrainingAsync(id)).unwrap();
    } catch (err) {
      console.error("Error deleting training:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      trainer: "",
      startDate: "",
      endDate: "",
      participants: [],
      completionStatus: "Not Started",
    });
    setEditingTraining(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Calculate statistics with safe access
  const totalTrainings = trainings?.length || 0;
  const completedTrainings =
    trainings?.filter((training) => training?.completionStatus === "Completed")
      .length || 0;
  const inProgressTrainings =
    trainings?.filter(
      (training) => training?.completionStatus === "In Progress"
    ).length || 0;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Training Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage employee training programs and sessions
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
              "+ Add Training"
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-700">
              Total Trainings
            </h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {totalTrainings}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-700">In Progress</h3>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {inProgressTrainings}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-700">Completed</h3>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {completedTrainings}
            </p>
          </div>
        </div>

        {/* Trainings Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          {loading && (trainings?.length === 0 || !trainings) ? (
            <div className="text-center py-12 text-gray-500">
              <div className="flex justify-center mb-4">
                <TailSpin
                  height={40}
                  width={40}
                  color="#2563EB"
                  ariaLabel="loading"
                />
              </div>
              Loading trainings...
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Training
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trainer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trainings?.map((training) => (
                  <tr key={training._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {training.title}
                      </div>
                      {training.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {training.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {training.trainer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(training.startDate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        to {formatDate(training.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {training.participants?.length || 0} employees
                      </div>
                      <div className="text-sm text-gray-500">
                        {training.participants
                          ?.slice(0, 2)
                          .map((emp) =>
                            typeof emp === "string" ? "Unknown" : emp.fullname
                          )
                          .join(", ")}
                        {training.participants?.length > 2 && "..."}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(training.completionStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(training)}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-900 mr-4 disabled:text-gray-400 flex items-center gap-1"
                      >
                        {loading && (
                          <TailSpin height={16} width={16} color="#2563EB" />
                        )}
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(training._id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-900 disabled:text-gray-400 flex items-center gap-1"
                      >
                        {loading && (
                          <TailSpin height={16} width={16} color="#DC2626" />
                        )}
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {(!trainings || trainings.length === 0) && !loading && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No training records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Training Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingTraining ? "Edit Training" : "Add New Training"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Training Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter training title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter training description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trainer *
                    </label>
                    <input
                      type="text"
                      name="trainer"
                      value={formData.trainer}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter trainer name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date *
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Participants
                    </label>
                    <select
                      multiple
                      name="participants"
                      value={formData.participants}
                      onChange={handleParticipantSelection}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                    >
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.fullname} - {emp.position} (
                          {emp.department?.name || "N/A"})
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                      Hold Ctrl/Cmd to select multiple employees
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Completion Status
                    </label>
                    <select
                      name="completionStatus"
                      value={formData.completionStatus}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
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
                        {editingTraining ? "Updating..." : "Saving..."}
                      </>
                    ) : editingTraining ? (
                      "Update Training"
                    ) : (
                      "Add Training"
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

export default TrainingPage;
