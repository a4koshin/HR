import React, { useState } from "react";
import { TailSpin } from "react-loader-spinner";
import DeptModel from "./deptModel";
import { useGetallFunctionQuery } from "../../store/DynamicApi";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiUsers,
  FiCalendar,
  FiInfo,
} from "react-icons/fi";
import { HiOutlineOfficeBuilding, HiStatusOnline } from "react-icons/hi";

const DepartmentPage = () => {
  const {
    data: deptData = [],
    isLoading,
    isError,
    refetch,
  } = useGetallFunctionQuery({ url: "/departments" });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

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

  const departments = deptData?.departments || [];

  const { data: empData } = useGetallFunctionQuery({ url: "/employees" });
  const employees = empData?.employees || [];

  const totalEmployees = employees.length;

  const inactiveDepartments = departments.filter(
    (dep) => dep.status === "Inactive"
  ).length;

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
                <p className="text-sm font-medium text-gray-600">
                  Total Departments
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {departments.length}
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
                <p className="text-sm font-medium text-gray-600">
                  Active Departments
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {departments.filter((dep) => dep.status === "Active").length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <HiStatusOnline className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Employees
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalEmployees}
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
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {inactiveDepartments}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <FiInfo className="text-2xl text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {isError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
            <div className="w-2 h-8 bg-red-500 rounded-full"></div>
            <div>
              <p className="font-medium">Error loading departments</p>
              <p className="text-sm">Please try again later</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && departments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="flex justify-center mb-4">
              <TailSpin
                height={50}
                width={50}
                color="#2563EB"
                ariaLabel="loading"
              />
            </div>
            <p className="text-gray-600 text-lg">Loading departments...</p>
          </div>
        ) : (
          // Departments Table
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
                    <tr
                      key={dep._id}
                      className="hover:bg-gray-50 transition-all duration-200 group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                              {dep.name?.charAt(0) || "D"}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-lg font-semibold text-gray-900 truncate">
                              {dep.name}
                            </p>
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
                          {
                            employees.filter(
                              (emp) =>
                                emp.department?._id === dep._id ||
                                emp.department === dep.name
                            ).length
                          }{" "}
                          employees
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
                              dep.status === "Active"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          {dep.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <FiCalendar className="w-4 h-4 text-gray-400" />
                          {dep.createdAt
                            ? new Date(dep.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
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
                            onClick={() => {
                              /* handleDelete(dep._id) */
                            }}
                            className="p-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 group-hover:scale-110"
                            title="Delete Department"
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
        )}

        {/* Department Modal */}
        <DeptModel
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleDeptSaved}
          department={editingDept}
        />
      </div>
    </div>
  );
};

export default DepartmentPage;
