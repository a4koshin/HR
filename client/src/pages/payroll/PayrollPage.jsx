import React, { useState } from "react";
import { TailSpin } from "react-loader-spinner";
import PayrollModel from "./payModel";
import { useGetallFunctionQuery } from "../../store/DynamicApi";
import { FiEdit2, FiTrash2, FiPlus, FiDollarSign, FiTrendingUp, FiUsers, FiCalendar, FiFilter } from "react-icons/fi";

const PayrollPage = () => {
  // --- RTK Query ---
  const { data: payrollData = [], isLoading, isError, refetch } = useGetallFunctionQuery({ url: "/payrolls" });

  // --- Local state ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [filter, setFilter] = useState({ employee: "", month: "", paidStatus: "" });

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

  // --- Filter change ---
  const handleFilterChange = (e) =>
    setFilter((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // --- Payrolls and filtered payrolls ---
  const payrolls = payrollData?.payrolls || [];
  const filteredPayrolls = payrolls.filter((p) => {
    const empMatch = !filter.employee || p.employee?._id === filter.employee;
    const monthMatch = !filter.month || p.month === filter.month;
    const statusMatch = !filter.paidStatus || p.paidStatus === filter.paidStatus;
    return empMatch && monthMatch && statusMatch;
  });

  // --- Stats ---
  const totalNetPay = filteredPayrolls.reduce((sum, p) => sum + (p.netPay || 0), 0);
  const totalDeductions = filteredPayrolls.reduce((sum, p) => sum + (p.deduction || 0), 0);
  const totalGrossPay = filteredPayrolls.reduce((sum, p) => sum + (p.grossPay || 0), 0);
  const paidCount = filteredPayrolls.filter((p) => p.paidStatus === "Paid").length;
  const pendingCount = filteredPayrolls.filter((p) => p.paidStatus === "Pending").length;

  // --- Format helpers ---
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const formatMonth = (monthString) => {
    if (!monthString) return "N/A";
    try {
      const [year, month] = monthString.split("-");
      return new Date(year, month - 1).toLocaleDateString("en-US", { year: "numeric", month: "long" });
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (status) => {
    const badgeStyles = {
      Paid: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: "🟢" },
      Pending: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: "🟡" },
      Unpaid: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "🔴" },
    };
    const style = badgeStyles[status] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: "⚪" };
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${style.bg} ${style.text} ${style.border}`}>
        {style.icon}
        {status}
      </span>
    );
  };

  // Get unique employees for filter dropdown
  const uniqueEmployees = [...new Map(payrolls.map(p => [p.employee?._id, p.employee])).values()].filter(Boolean);

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
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Net Pay</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(totalNetPay)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <FiDollarSign className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gross Pay</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{formatCurrency(totalGrossPay)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiTrendingUp className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deductions</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{formatCurrency(totalDeductions)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <FiTrendingUp className="text-2xl text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid Records</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
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

        {/* Filters */}
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
                  <option key={emp._id} value={emp._id}>{emp.fullname}</option>
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
            <div className="text-center py-16">
              <div className="flex justify-center mb-4">
                <TailSpin height={50} width={50} color="#2563EB" ariaLabel="loading" />
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
                    <tr key={p._id} className="hover:bg-gray-50 transition-all duration-200 group">
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200 group-hover:scale-110"
                            title="Edit Payroll"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => console.log("Delete payroll", p._id)}
                            className="p-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 group-hover:scale-110"
                            title="Delete Payroll"
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
          )}

          {/* Empty State */}
          {filteredPayrolls.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FiDollarSign className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No payroll records found</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first payroll record</p>
              <button
                onClick={openAddModal}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
              >
                <FiPlus className="text-lg" />
                Add First Payroll
              </button>
            </div>
          )}
        </div>

        {/* Payroll Modal */}
        <PayrollModel
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handlePayrollSaved}
          payroll={editingPayroll}
        />
      </div>
    </div>
  );
};

export default PayrollPage;