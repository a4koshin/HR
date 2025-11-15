import React, { useState } from "react";
import { TailSpin } from "react-loader-spinner";
import DeptModel from "./deptModel";
import {
  useGetallFunctionQuery,
  useUpdateFunctionMutation,
} from "../../store/DynamicApi";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiUsers,
  FiCalendar,
  FiInfo,
  FiAlertTriangle,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { HiOutlineOfficeBuilding, HiStatusOnline } from "react-icons/hi";

const DepartmentPage = () => {
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  
  // API Queries
  const {
    data: deptData = {},
    isLoading,
    isError,
    refetch,
  } = useGetallFunctionQuery({ url: `/departments?page=${currentPage}` });

  const [updateDepartment, { isLoading: isUpdating }] = useUpdateFunctionMutation();
  const { data: empData } = useGetallFunctionQuery({ url: "/employees" });

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);

  // Derived Data
  const departments = deptData?.departments || [];
  const employees = empData?.employees || [];
  const totalPages = deptData?.pages || 1;
  const totalDepartments = deptData?.total || 0;
  const activeDepartments = departments.filter(dep => dep.status === "Active").length;
  const inactiveDepartments = departments.filter(dep => dep.status === "Inactive").length;

  // Pagination Handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const generatePageNumbers = () => {
    const totalPages = deptData.pages || 1;
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
    setEditingDept(null);
    setIsModalOpen(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDept(null);
  };

  const handleDeptSaved = () => {
    closeModal();
    refetch();
  };

  // Delete Handlers
  const openDeleteModal = (department) => {
    setDepartmentToDelete(department);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDepartmentToDelete(null);
  };

  const handleDelete = async () => {
    if (!departmentToDelete) return;

    try {
      await updateDepartment({
        id: departmentToDelete._id,
        url: "departments/delete",
      }).unwrap();

      console.log("Department deleted successfully!");
      refetch();

      // Adjust pagination if last item on page was deleted
      if (departments.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting department:", error);
    }
  };

  // Helper Functions
  const getEmployeeCount = (department) => {
    return employees.filter(
      (emp) => emp.department?._id === department._id || emp.department === department.name
    ).length;
  };

  const hasAssignedEmployees = (department) => {
    return getEmployeeCount(department) > 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-8xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-6 sm:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Department Management
              </h1>
              <p className="text-gray-600 mt-3 text-lg">
                Organize and manage your hospital departments efficiently
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
                  <span>Add Department</span>
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
                <p className="text-sm font-medium text-gray-600">Total Departments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalDepartments}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {currentPage === 1 ? 'Showing first 10' : `Page ${currentPage} of ${totalPages}`}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <HiOutlineOfficeBuilding className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Departments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{activeDepartments}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <HiStatusOnline className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{employees.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <FiUsers className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{inactiveDepartments}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <FiInfo className="text-2xl text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Status Management: Error State */}
        {isError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
            <div className="w-2 h-8 bg-red-500 rounded-full"></div>
            <div>
              <p className="font-medium">Error loading departments</p>
              <p className="text-sm">Please try again later</p>
            </div>
          </div>
        )}

        {/* Status Management: Loading State */}
        {isLoading && departments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="flex justify-center mb-4">
              <TailSpin height={50} width={50} color="#2563EB" ariaLabel="loading" />
            </div>
            <p className="text-gray-600 text-lg">Loading departments...</p>
          </div>
        ) : (
          <>
            {/* Departments Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Department Details
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Employees
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {departments.map((dep) => (
                      <tr key={dep._id} className="hover:bg-gray-50 transition-all duration-200 group">
                        <td className="px-8 py-5">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                                {dep.name?.charAt(0) || "D"}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-lg font-semibold text-gray-900 truncate">{dep.name}</p>
                              {dep.description && (
                                <p className="text-gray-500 text-sm truncate max-w-xs mt-1">
                                  {dep.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-gray-900 font-semibold">
                            <FiUsers className="w-4 h-4 text-purple-600" />
                            {getEmployeeCount(dep)} employees
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                              dep.status === "Active"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                dep.status === "Active" ? "bg-green-500" : "bg-red-500"
                              }`}
                            ></div>
                            {dep.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <FiCalendar className="w-4 h-4 text-gray-400" />
                            {dep.createdAt
                              ? new Date(dep.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(dep)}
                              className="p-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200 group-hover:scale-110"
                              title="Edit Department"
                            >
                              <FiEdit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(dep)}
                              disabled={isUpdating}
                              className="p-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 group-hover:scale-110 disabled:opacity-50"
                              title="Delete Department"
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
              {departments.length === 0 && !isLoading && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <HiOutlineOfficeBuilding className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No departments found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Get started by creating your first department
                  </p>
                  <button
                    onClick={openAddModal}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
                  >
                    <FiPlus className="text-lg" />
                    Create First Department
                  </button>
                </div>
              )}
            </div>

            {/* Pagination Management */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center justify-center mt-8 space-y-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-blue-600">{departments.length}</span> of{" "}
                  <span className="font-semibold text-blue-600">{totalDepartments}</span> departments
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

        {/* Department Modal */}
        <DeptModel
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleDeptSaved}
          department={editingDept}
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
                  <h3 className="text-xl font-semibold text-gray-900">Delete Department</h3>
                  <p className="text-sm text-gray-500 mt-1">This action is permanent</p>
                </div>
              </div>

              <div className="my-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700">
                  Are you sure you want to delete{" "}
                  <strong className="text-red-600">{departmentToDelete?.name}</strong>
                  ? This action cannot be undone and all associated data will be permanently removed.
                </p>
                {departmentToDelete && hasAssignedEmployees(departmentToDelete) && (
                  <p className="text-orange-600 text-sm mt-2 font-medium">
                    ⚠️ This department has employees assigned to it!
                  </p>
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
                      Delete Department
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

export default DepartmentPage;