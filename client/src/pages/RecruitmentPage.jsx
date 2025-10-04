import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { TailSpin } from "react-loader-spinner";
import {
  fetchRecruitments,
  addRecruitment,
  editRecruitment,
  removeRecruitment,
  updateStatus,
  clearMessages,
} from "../slices/recruitmentSlice";
import { getEmployees } from "../services/employeeService";

const RecruitmentPage = () => {
  const dispatch = useDispatch();
  const {
    list: recruitments,
    loading,
    error,
    success,
  } = useSelector((state) => state.recruitments);

  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState({
    department: "",
    status: "",
    jobType: "",
  });
  const [formData, setFormData] = useState({
    position: "",
    department: "",
    jobType: "Full-time",
    experienceLevel: "Mid",
    location: "",
    salaryRange: { min: "", max: "" },
    jobDescription: "",
    requirements: [""],
    responsibilities: [""],
    status: "Draft",
    applicationDeadline: "",
    numberOfOpenings: "",
    hiringManager: "",
    tags: [],
    isRemote: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecruitment, setEditingRecruitment] = useState(null);
  const [newTag, setNewTag] = useState("");

  // --- Utility Functions ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (status) => {
    const badgeStyles = {
      Published: "bg-green-100 text-green-800",
      Draft: "bg-gray-100 text-gray-800",
      Closed: "bg-red-100 text-red-800",
      "On Hold": "bg-yellow-100 text-yellow-800",
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

  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  // --- Fetch Data ---
  useEffect(() => {
    dispatch(fetchRecruitments());
    fetchEmployees();
  }, [dispatch]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch]);

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setEmployees([]);
    }
  };

  // --- Form Handling ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("salaryRange.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        salaryRange: {
          ...prev.salaryRange,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleArrayFieldChange = (field, index, value) => {
    setFormData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayField = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayField = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Filter out empty requirements and responsibilities
      const submissionData = {
        ...formData,
        requirements: formData.requirements.filter((req) => req.trim() !== ""),
        responsibilities: formData.responsibilities.filter(
          (resp) => resp.trim() !== ""
        ),
        salaryRange: {
          min: parseFloat(formData.salaryRange.min),
          max: parseFloat(formData.salaryRange.max),
        },
        numberOfOpenings: parseInt(formData.numberOfOpenings),
      };

      if (editingRecruitment) {
        await dispatch(
          editRecruitment({
            id: editingRecruitment._id,
            payload: submissionData,
          })
        ).unwrap();
      } else {
        await dispatch(addRecruitment(submissionData)).unwrap();
      }

      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      // Error is handled by the slice
      console.error("Error saving recruitment:", err);
    }
  };

  const handleEdit = (recruitment) => {
    setEditingRecruitment(recruitment);
    setFormData({
      position: recruitment.position || "",
      department: recruitment.department || "",
      jobType: recruitment.jobType || "Full-time",
      experienceLevel: recruitment.experienceLevel || "Mid",
      location: recruitment.location || "",
      salaryRange: {
        min: recruitment.salaryRange?.min?.toString() || "",
        max: recruitment.salaryRange?.max?.toString() || "",
      },
      jobDescription: recruitment.jobDescription || "",
      requirements:
        recruitment.requirements?.length > 0 ? recruitment.requirements : [""],
      responsibilities:
        recruitment.responsibilities?.length > 0
          ? recruitment.responsibilities
          : [""],
      status: recruitment.status || "Draft",
      applicationDeadline: recruitment.applicationDeadline
        ? new Date(recruitment.applicationDeadline).toISOString().split("T")[0]
        : "",
      numberOfOpenings: recruitment.numberOfOpenings?.toString() || "",
      hiringManager:
        recruitment.hiringManager?._id || recruitment.hiringManager || "",
      tags: recruitment.tags || [],
      isRemote: recruitment.isRemote || false,
    });
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await dispatch(updateStatus({ id, status: newStatus })).unwrap();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this recruitment record?"
      )
    )
      return;
    try {
      await dispatch(removeRecruitment(id)).unwrap();
    } catch (err) {
      console.error("Error deleting recruitment:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      position: "",
      department: "",
      jobType: "Full-time",
      experienceLevel: "Mid",
      location: "",
      salaryRange: { min: "", max: "" },
      jobDescription: "",
      requirements: [""],
      responsibilities: [""],
      status: "Draft",
      applicationDeadline: "",
      numberOfOpenings: "",
      hiringManager: "",
      tags: [],
      isRemote: false,
    });
    setEditingRecruitment(null);
    setNewTag("");
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // --- Filtering & Stats ---
  const filteredRecruitments = Array.isArray(recruitments)
    ? recruitments.filter((recruitment) => {
        const deptMatch =
          !filter.department || recruitment.department === filter.department;
        const statusMatch =
          !filter.status || recruitment.status === filter.status;
        const jobTypeMatch =
          !filter.jobType || recruitment.jobType === filter.jobType;
        return deptMatch && statusMatch && jobTypeMatch;
      })
    : [];

  const totalOpenings = filteredRecruitments.reduce(
    (sum, recruitment) => sum + (recruitment.numberOfOpenings || 0),
    0
  );

  const totalApplications = filteredRecruitments.reduce(
    (sum, recruitment) => sum + (recruitment.applicationsReceived || 0),
    0
  );

  const activeJobs = filteredRecruitments.filter(
    (recruitment) => recruitment.status === "Published"
  ).length;

  // Get unique departments for filter dropdown
  const departments = [
    ...new Set(recruitments.map((r) => r.department).filter(Boolean)),
  ];

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
              Manage job postings and recruitment process
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                name="department"
                value={filter.department}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={filter.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="On Hold">On Hold</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Type
              </label>
              <select
                name="jobType"
                value={filter.jobType}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Job Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-700">
              Total Openings
            </h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {totalOpenings}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-700">
              Total Applications
            </h3>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {totalApplications}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-700">Active Jobs</h3>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {activeJobs}
            </p>
          </div>
        </div>

        {/* Recruitment Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          {loading && filteredRecruitments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="flex justify-center mb-4">
                <TailSpin
                  height={40}
                  width={40}
                  color="#2563EB"
                  ariaLabel="loading"
                />
              </div>
              Loading recruitment records...
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type/Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Salary Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Openings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Applications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecruitments.map((recruitment) => (
                  <tr
                    key={recruitment._id}
                    className={
                      isDeadlinePassed(recruitment.applicationDeadline)
                        ? "bg-red-50"
                        : ""
                    }
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {recruitment.position}
                      </div>
                      <div className="text-sm text-gray-500">
                        {recruitment.location}
                        {recruitment.isRemote && " • Remote"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {recruitment.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {recruitment.jobType}
                      </div>
                      <div className="text-sm text-gray-500">
                        {recruitment.experienceLevel}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(recruitment.salaryRange?.min)} -{" "}
                      {formatCurrency(recruitment.salaryRange?.max)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {recruitment.numberOfOpenings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {recruitment.applicationsReceived || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(recruitment.applicationDeadline)}
                      {isDeadlinePassed(recruitment.applicationDeadline) && (
                        <span className="ml-1 text-xs text-red-600">
                          (Expired)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(recruitment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleEdit(recruitment)}
                          disabled={loading}
                          className="text-blue-600 hover:text-blue-900 text-left disabled:text-gray-400 flex items-center gap-1"
                        >
                          {loading && (
                            <TailSpin height={16} width={16} color="#2563EB" />
                          )}
                          Edit
                        </button>
                        {recruitment.status === "Published" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(recruitment._id, "Closed")
                            }
                            disabled={loading}
                            className="text-yellow-600 hover:text-yellow-900 text-left disabled:text-gray-400 flex items-center gap-1"
                          >
                            {loading && (
                              <TailSpin
                                height={16}
                                width={16}
                                color="#D97706"
                              />
                            )}
                            Close
                          </button>
                        )}
                        {recruitment.status === "Draft" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(recruitment._id, "Published")
                            }
                            disabled={loading}
                            className="text-green-600 hover:text-green-900 text-left disabled:text-gray-400 flex items-center gap-1"
                          >
                            {loading && (
                              <TailSpin
                                height={16}
                                width={16}
                                color="#059669"
                              />
                            )}
                            Publish
                          </button>
                        )}
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
                ))}
                {filteredRecruitments.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No recruitment records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Recruitment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingRecruitment ? "Edit Job Posting" : "Create Job Posting"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position Title *
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department *
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Type *
                    </label>
                    <select
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience Level *
                    </label>
                    <select
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Entry">Entry</option>
                      <option value="Mid">Mid</option>
                      <option value="Senior">Senior</option>
                      <option value="Lead">Lead</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hiring Manager *
                    </label>
                    <select
                      name="hiringManager"
                      value={formData.hiringManager}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Hiring Manager</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.fullname} - {emp.position || emp.role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Salary Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Salary *
                    </label>
                    <input
                      type="number"
                      name="salaryRange.min"
                      value={formData.salaryRange.min}
                      onChange={handleInputChange}
                      required
                      step="1000"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Salary *
                    </label>
                    <input
                      type="number"
                      name="salaryRange.max"
                      value={formData.salaryRange.max}
                      onChange={handleInputChange}
                      required
                      step="1000"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Job Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Openings *
                    </label>
                    <input
                      type="number"
                      name="numberOfOpenings"
                      value={formData.numberOfOpenings}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Application Deadline *
                    </label>
                    <input
                      type="date"
                      name="applicationDeadline"
                      value={formData.applicationDeadline}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Remote Work & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isRemote"
                      checked={formData.isRemote}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Remote Position
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                {/* Job Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Description *
                  </label>
                  <textarea
                    name="jobDescription"
                    value={formData.jobDescription}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements *
                  </label>
                  {formData.requirements.map((requirement, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={requirement}
                        onChange={(e) =>
                          handleArrayFieldChange(
                            "requirements",
                            index,
                            e.target.value
                          )
                        }
                        required
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Requirement ${index + 1}`}
                      />
                      {formData.requirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayField("requirements", index)
                          }
                          className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField("requirements")}
                    className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    + Add Requirement
                  </button>
                </div>

                {/* Responsibilities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsibilities *
                  </label>
                  {formData.responsibilities.map((responsibility, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={responsibility}
                        onChange={(e) =>
                          handleArrayFieldChange(
                            "responsibilities",
                            index,
                            e.target.value
                          )
                        }
                        required
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Responsibility ${index + 1}`}
                      />
                      {formData.responsibilities.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayField("responsibilities", index)
                          }
                          className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField("responsibilities")}
                    className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    + Add Responsibility
                  </button>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add a tag"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Tag
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
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
                        {editingRecruitment ? "Updating..." : "Saving..."}
                      </>
                    ) : editingRecruitment ? (
                      "Update Job Posting"
                    ) : (
                      "Create Job Posting"
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
