import React, { useState } from "react";
import { TailSpin } from "react-loader-spinner";
import PayrollModel from "./payModel";
import { useGetallFunctionQuery, useUpdateFunctionMutation } from "../../store/DynamicApi";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
  FiCalendar,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
} from "react-icons/fi";
import { toast } from "react-toastify";

const PayrollPage = () => {
  // --- RTK Query ---
  const [currentPage, setCurrentPage] = useState(1);
  const {
    data: payrollData = {},
    isLoading,
    isError,
    refetch,
  } = useGetallFunctionQuery({ url: `/payrolls?page=${currentPage}` });

  const [updatePayroll, { isLoading: isUpdating }] = useUpdateFunctionMutation();

  // --- Local state ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [payrollToDelete, setPayrollToDelete] = useState(null);
  const [filter, setFilter] = useState({
    employee: "",
    month: "",
    paidStatus: "",
  });

  // --- Modal handlers ---
  const openAddModal = () => {
    setEditingPayroll(null);
    setIsModalOpen(true);
  };

  const openEditModal = (payroll) => {
    setEditingPayroll(payroll);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPayroll(null);
  };

  const handlePayrollSaved = () => {
    closeModal();
    refetch();
  };

  // --- Delete functionality (using EmployeePage pattern) ---
  const openDeleteModal = (payroll) => {
    setPayrollToDelete(payroll);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPayrollToDelete(null);
  };

  const handleDelete = async () => {
    if (!payrollToDelete) return;

    try {
      await updatePayroll({
        id: payrollToDelete._id,
        url: "payrolls/delete",
      }).unwrap();

      toast.success("Payroll deleted successfully!");
      refetch();

      // Using the same pattern as EmployeePage but with payrolls
      if (payrolls.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting payroll:", error);
    }
  };

  // --- Pagination (using EmployeePage pattern) ---
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const generatePageNumbers = () => {
    const totalPages = payrollData.pages || 1;
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

  // --- Filter change (Payroll specific) ---
  const handleFilterChange = (e) =>
    setFilter((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // --- Payrolls and filtered payrolls ---
  const payrolls = payrollData?.payrolls || [];
  const filteredPayrolls = payrolls.filter((p) => {
    const empMatch = !filter.employee || p.employee?._id === filter.employee;
    const monthMatch = !filter.month || p.month === filter.month;
    const statusMatch =
      !filter.paidStatus || p.paidStatus === filter.paidStatus;
    return empMatch && monthMatch && statusMatch;
  });

  // --- Stats (Payroll specific) ---
  const totalNetPay = filteredPayrolls.reduce(
    (sum, p) => sum + (p.netPay || 0),
    0
  );
  const totalDeductions = filteredPayrolls.reduce(
    (sum, p) => sum + (p.deduction || 0),
    0
  );
  const totalGrossPay = filteredPayrolls.reduce(
    (sum, p) => sum + (p.grossPay || 0),
    0
  );
  const paidCount = filteredPayrolls.filter(
    (p) => p.paidStatus === "Paid"
  ).length;

  // --- Format helpers (Payroll specific) ---
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const formatMonth = (monthString) => {
    if (!monthString) return "N/A";
    try {
      const [year, month] = monthString.split("-");
      return new Date(year, month - 1).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
    } catch {
      return "Invalid Date";
    }
  };

  // Status badge function (Payroll specific)
  const getStatusBadge = (status) => {
    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
          status === "Paid"
            ? "bg-green-50 text-green-700 border border-green-200"
            : status === "Pending"
            ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            status === "Paid"
              ? "bg-green-500"
              : status === "Pending"
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
        ></div>
        {status}
      </span>
    );
  };

  const totalPages = payrollData?.pages || 1;
  const totalRecords = payrollData?.total || 0;

  // Get unique employees for filter dropdown (Payroll specific)
  const uniqueEmployees = [
    ...new Map(payrolls.map((p) => [p.employee?._id, p.employee])).values(),
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-8xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-6 sm:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Payroll Management
              </h1>
              <p className="text-gray-600 mt-3 text-lg">
                Manage employee salaries, deductions, and payment records
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
                  <span>Add Payroll</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Records
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalRecords}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <FiUsers className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Net Pay
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(totalNetPay)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <FiDollarSign className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gross Pay</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(totalGrossPay)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiTrendingUp className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Paid Records
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {paidCount} / {filteredPayrolls.length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <FiUsers className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {isError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
            <div className="w-2 h-8 bg-red-500 rounded-full"></div>
            <div>
              <p className="font-medium">Error loading payroll records</p>
              <p className="text-sm">Please try again later</p>
            </div>
          </div>
        )}

        {/* Filters (Payroll specific) */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiFilter className="w-5 h-5 text-blue-600" />
            Filter Records
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FiUsers className="w-4 h-4 text-blue-600" />
                Employee
              </label>
              <select
                name="employee"
                value={filter.employee}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option value="">All Employees</option>
                {uniqueEmployees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.fullname}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FiCalendar className="w-4 h-4 text-blue-600" />
                Month
              </label>
              <input
                type="month"
                name="month"
                value={filter.month}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FiDollarSign className="w-4 h-4 text-blue-600" />
                Status
              </label>
              <select
                name="paidStatus"
                value={filter.paidStatus}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option value="">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {isLoading && payrolls.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <div className="flex justify-center mb-4">
                <TailSpin
                  height={50}
                  width={50}
                  color="#2563EB"
                  ariaLabel="loading"
                />
              </div>
              <p className="text-gray-600 text-lg">Loading payroll records...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Employee Details
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Pay Period
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Salary Breakdown
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
                  {filteredPayrolls.map((p) => (
                    <tr
                      key={p._id}
                      className="hover:bg-gray-50 transition-all duration-200 group cursor-pointer"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                              {(p.employee?.fullname || "U").charAt(0)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-lg font-semibold text-gray-900 truncate">
                              {p.employee?.fullname || "N/A"}
                            </p>
                            <p className="text-gray-500 text-sm truncate">
                              {p.employee?.position || "No position"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-gray-900 font-medium">
                          <FiCalendar className="w-4 h-4 text-blue-600" />
                          {formatMonth(p.month)}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-900 font-semibold">
                            <FiDollarSign className="w-4 h-4 text-green-600" />
                            {formatCurrency(p.netPay || 0)}
                          </div>
                          {p.deduction > 0 && (
                            <div className="text-sm text-gray-500">
                              Deductions: {formatCurrency(p.deduction || 0)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(p.paidStatus)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200 group-hover:scale-110"
                            title="Edit Payroll"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(p)}
                            disabled={isUpdating}
                            className="p-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 group-hover:scale-110 disabled:opacity-50"
                            title="Delete Payroll"
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
          )}

          {/* Empty State */}
          {filteredPayrolls.length === 0 && !isLoading && (
            <div className="bg-white text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FiDollarSign className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No payroll records found
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by adding your first payroll record
              </p>
              <button
                onClick={openAddModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-200"
              >
                Add First Payroll
              </button>
            </div>
          )}
        </div>

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

        {/* Payroll Modal */}
        <PayrollModel
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handlePayrollSaved}
          payroll={editingPayroll}
        />

        {/* Delete Confirmation Modal (using EmployeePage pattern) */}
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
                    Delete Payroll
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This action is permanent
                  </p>
                </div>
              </div>

              <div className="my-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700">
                  Are you sure you want to delete the payroll record for{" "}
                  <strong className="text-red-600">
                    {payrollToDelete?.employee?.fullname || "Unknown Employee"}
                  </strong>{" "}
                  for{" "}
                  <strong className="text-red-600">
                    {formatMonth(payrollToDelete?.month)}
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
                      Delete Payroll
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

export default PayrollPage;