import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { TailSpin } from "react-loader-spinner";


const RecruitmentPage = () => {
  const dispatch = useDispatch();
  const { recruitments, loading, error, success } = useSelector(
    (state) => state.recruitment
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applicantModalOpen, setApplicantModalOpen] = useState(false);
  const [hireModalOpen, setHireModalOpen] = useState(false);
  const [editingRecruitment, setEditingRecruitment] = useState(null);
  const [selectedRecruitment, setSelectedRecruitment] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [formData, setFormData] = useState({
    jobTitle: "",
    description: "",
  });
  const [applicantData, setApplicantData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    dispatch(fetchRecruitments());
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
      hired: "bg-green-100 text-green-800",
      interview: "bg-blue-100 text-blue-800",
      applied: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          badgeStyles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getApplicantStats = (applicants) => {
    const stats = {
      applied: 0,
      interview: 0,
      hired: 0,
      rejected: 0,
      total: applicants.length
    };
    
    applicants.forEach(applicant => {
      if (stats[applicant.status] !== undefined) {
        stats[applicant.status]++;
      }
    });
    
    return stats;
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplicantInputChange = (e) => {
    const { name, value } = e.target;
    setApplicantData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecruitment) {
        await dispatch(
          updateRecruitmentAsync({ id: editingRecruitment._id, data: formData })
        ).unwrap();
      } else {
        await dispatch(createRecruitmentAsync(formData)).unwrap();
      }
      closeModal();
    } catch (err) {
      console.error("Error saving recruitment:", err);
    }
  };

  const handleAddApplicant = async (e) => {
    e.preventDefault();
    try {
      const updatedRecruitment = {
        ...selectedRecruitment,
        applicants: [...selectedRecruitment.applicants, { ...applicantData, status: "applied" }]
      };
      
      await dispatch(
        updateRecruitmentAsync({ id: selectedRecruitment._id, data: updatedRecruitment })
      ).unwrap();
      closeApplicantModal();
    } catch (err) {
      console.error("Error adding applicant:", err);
    }
  };

  const handleHireApplicant = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        hireApplicantAsync({ 
          id: selectedRecruitment._id, 
          applicantEmail: selectedApplicant.email 
        })
      ).unwrap();
      closeHireModal();
    } catch (err) {
      console.error("Error hiring applicant:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job posting?"))
      return;
    try {
      await dispatch(deleteRecruitmentAsync(id)).unwrap();
    } catch (err) {
      console.error("Error deleting recruitment:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      jobTitle: "",
      description: "",
    });
    setEditingRecruitment(null);
  };

  const resetApplicantForm = () => {
    setApplicantData({
      name: "",
      email: "",
    });
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (recruitment) => {
    setEditingRecruitment(recruitment);
    setFormData({
      jobTitle: recruitment.jobTitle,
      description: recruitment.description,
    });
    setIsModalOpen(true);
  };

  const openApplicantModal = (recruitment) => {
    setSelectedRecruitment(recruitment);
    resetApplicantForm();
    setApplicantModalOpen(true);
  };

  const openHireModal = (recruitment, applicant) => {
    setSelectedRecruitment(recruitment);
    setSelectedApplicant(applicant);
    setHireModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const closeApplicantModal = () => {
    setApplicantModalOpen(false);
    setSelectedRecruitment(null);
    resetApplicantForm();
  };

  const closeHireModal = () => {
    setHireModalOpen(false);
    setSelectedRecruitment(null);
    setSelectedApplicant(null);
  };

  // Calculate statistics
  const totalJobs = recruitments.length;
  const totalApplicants = recruitments.reduce(
    (sum, recruitment) => sum + recruitment.applicants.length,
    0
  );
  const totalHired = recruitments.filter(
    (recruitment) => recruitment.hiredEmployeeId
  ).length;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Recruitment Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage job postings and track applicants
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
              "+ Create Job Posting"
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
              Active Jobs
            </h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {totalJobs}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-700">
              Total Applicants
            </h3>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {totalApplicants}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-700">Hired</h3>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {totalHired}
            </p>
          </div>
        </div>

        {/* Recruitment Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          {loading && recruitments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="flex justify-center mb-4">
                <TailSpin height={40} width={40} color="#2563EB" ariaLabel="loading" />
              </div>
              Loading recruitment records...
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recruitments.map((recruitment) => {
                  const stats = getApplicantStats(recruitment.applicants);
                  return (
                    <tr key={recruitment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {recruitment.jobTitle}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {recruitment.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {stats.total} applicants
                        </div>
                        <div className="text-xs text-gray-500 space-x-1">
                          <span className="text-green-600">{stats.hired} hired</span>
                          <span>•</span>
                          <span className="text-blue-600">{stats.interview} interview</span>
                          <span>•</span>
                          <span className="text-yellow-600">{stats.applied} applied</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {recruitment.hiredEmployeeId ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Position Filled
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Hiring
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(recruitment.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => openEditModal(recruitment)}
                            disabled={loading}
                            className="text-blue-600 hover:text-blue-900 text-left disabled:text-gray-400 flex items-center gap-1"
                          >
                            {loading && (
                              <TailSpin height={16} width={16} color="#2563EB" />
                            )}
                            Edit
                          </button>
                          <button
                            onClick={() => openApplicantModal(recruitment)}
                            disabled={loading}
                            className="text-green-600 hover:text-green-900 text-left disabled:text-gray-400 flex items-center gap-1"
                          >
                            {loading && (
                              <TailSpin height={16} width={16} color="#059669" />
                            )}
                            Add Applicant
                          </button>
                          <button
                            onClick={() => handleDelete(recruitment._id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-900 text-left disabled:text-gray-400 flex items-center gap-1"
                          >
                            {loading && (
                              <TailSpin height={16} width={16} color="#DC2626" />
                            )}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {recruitments.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No job postings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Applicants List for Each Job */}
        {recruitments.map((recruitment) => (
          <div key={recruitment._id} className="mt-6 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Applicants for {recruitment.jobTitle}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
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
                  {recruitment.applicants.map((applicant, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {applicant.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {applicant.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(applicant.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {applicant.status !== "hired" && !recruitment.hiredEmployeeId && (
                          <button
                            onClick={() => openHireModal(recruitment, applicant)}
                            disabled={loading}
                            className="text-green-600 hover:text-green-900 disabled:text-gray-400 flex items-center gap-1"
                          >
                            {loading && (
                              <TailSpin height={16} width={16} color="#059669" />
                            )}
                            Hire
                          </button>
                        )}
                        {applicant.status === "hired" && (
                          <span className="text-green-600">Hired</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {recruitment.applicants.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        No applicants yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingRecruitment ? "Edit Job Posting" : "Create Job Posting"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter job title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter job description"
                  />
                </div>

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
                        {editingRecruitment ? "Updating..." : "Creating..."}
                      </>
                    ) : editingRecruitment ? (
                      "Update Job"
                    ) : (
                      "Create Job"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Applicant Modal */}
      {applicantModalOpen && selectedRecruitment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                Add Applicant to {selectedRecruitment.jobTitle}
              </h2>
              <form onSubmit={handleAddApplicant} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={applicantData.name}
                    onChange={handleApplicantInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter applicant name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={applicantData.email}
                    onChange={handleApplicantInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter applicant email"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeApplicantModal}
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
                        Adding...
                      </>
                    ) : (
                      "Add Applicant"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Hire Applicant Modal */}
      {hireModalOpen && selectedRecruitment && selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Hire Applicant</h2>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Applicant
                  </label>
                  <p className="text-sm text-gray-900">{selectedApplicant.name}</p>
                  <p className="text-sm text-gray-600">{selectedApplicant.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <p className="text-sm text-gray-900">{selectedRecruitment.jobTitle}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-sm text-yellow-800">
                    This will create an employee record and mark this applicant as hired.
                  </p>
                </div>
              </div>
              <form onSubmit={handleHireApplicant}>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeHireModal}
                    disabled={loading}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:text-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 font-medium"
                  >
                    {loading ? (
                      <>
                        <TailSpin height={20} width={20} color="#FFFFFF" />
                        Hiring...
                      </>
                    ) : (
                      "Hire Applicant"
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

export default RecruitmentPage;