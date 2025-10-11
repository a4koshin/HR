import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { TailSpin } from "react-loader-spinner";


const PayrollPage = () => {
  const dispatch = useDispatch();

  // --- Local UI state ---
  const [filter, setFilter] = useState({
    employee: "",
    month: "",
    paidStatus: "",
  });
  const [formData, setFormData] = useState({
    employee: "",
    month: new Date().toISOString().slice(0, 7),
    basicSalary: "",
    overtimeHours: "",
    overtimeRate: "",
    deduction: "",
    paySlipUrl: "",
    paidStatus: "Unpaid",
    paymentMethod: "Bank Transfer",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);

  // --- Redux state ---
  const payrollState = useSelector((state) => state.payrolls);
  const employeesState = useSelector((state) => state.employee);

  const payrolls = payrollState?.list || [];
  const loading = payrollState?.loading || false;
  const error = payrollState?.error || null;
  const success = payrollState?.success || null;
  const payrollEnums = payrollState?.enums || {
    paidStatus: ["Paid", "Pending", "Unpaid"],
    paymentMethod: ["Bank Transfer", "Cash", "Other"],
  };
  const employees = employeesState?.list || [];

  // --- Effects ---
  useEffect(() => {
    dispatch(fetchPayrolls());
    dispatch(fetchEmployees());
    dispatch(fetchPayrollEnums());
  }, [dispatch]);

  useEffect(() => {
    if (error || success) {
      setTimeout(() => dispatch(clearMessages()), 3000);
    }
  }, [error, success, dispatch]);

  // --- Memoized filtered payrolls ---
  const selectFilteredPayrolls = createSelector(
    [(state) => state.payrolls.list, (_, filter) => filter],
    (payrollsList, filter) => {
      return (payrollsList || []).filter((p) => {
        const empMatch =
          !filter.employee || p.employee?._id === filter.employee;
        const monthMatch = !filter.month || p.month === filter.month;
        const statusMatch =
          !filter.paidStatus || p.paidStatus === filter.paidStatus;
        return empMatch && monthMatch && statusMatch;
      });
    }
  );

  const filteredPayrolls = useSelector((state) =>
    selectFilteredPayrolls(state, filter)
  );

  // --- Utility functions ---
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

  const getStatusBadge = (status) => {
    const badgeStyles = {
      Paid: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Unpaid: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 inline-flex text-xs font-semibold rounded-full ${
          badgeStyles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  // --- Handlers ---
  const handleInputChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFilterChange = (e) =>
    setFilter((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const resetForm = () => {
    setFormData({
      employee: "",
      month: new Date().toISOString().slice(0, 7),
      basicSalary: "",
      overtimeHours: "",
      overtimeRate: "",
      deduction: "",
      paySlipUrl: "",
      paidStatus: "Unpaid",
      paymentMethod: "Bank Transfer",
    });
    setEditingPayroll(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      employee: formData.employee,
      month: formData.month,
      basicSalary: parseFloat(formData.basicSalary),
      overtimeHours: parseFloat(formData.overtimeHours) || 0,
      overtimeRate: parseFloat(formData.overtimeRate) || 0,
      deduction: parseFloat(formData.deduction) || 0,
      paySlipUrl: formData.paySlipUrl,
      paidStatus: formData.paidStatus,
      paymentMethod: formData.paymentMethod,
    };

    if (editingPayroll) {
      await dispatch(editPayroll({ id: editingPayroll._id, payload }));
    } else {
      await dispatch(addPayroll(payload));
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (payroll) => {
    setEditingPayroll(payroll);
    setFormData({
      employee: payroll.employee?._id || "",
      month: payroll.month || new Date().toISOString().slice(0, 7),
      basicSalary: payroll.basicSalary?.toString() || "",
      overtimeHours: payroll.overtimeHours?.toString() || "",
      overtimeRate: payroll.overtimeRate?.toString() || "",
      deduction: payroll.deduction?.toString() || "",
      paySlipUrl: payroll.paySlipUrl || "",
      paidStatus: payroll.paidStatus || "Unpaid",
      paymentMethod: payroll.paymentMethod || "Bank Transfer",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payroll record?"))
      return;
    dispatch(removePayroll(id));
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // --- Stats ---
  const totalNetPay = filteredPayrolls.reduce(
    (sum, p) => sum + (p.netPay || 0),
    0
  );
  const totalDeductions = filteredPayrolls.reduce(
    (sum, p) => sum + (p.deduction || 0),
    0
  );
  const paidCount = filteredPayrolls.filter(
    (p) => p.paidStatus === "Paid"
  ).length;

  // --- JSX ---
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Payroll Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and track employee payroll records
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
              "+ Add Payroll Record"
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
            {/* Employee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee
              </label>
              <select
                name="employee"
                value={filter.employee}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.fullname} - {emp.email}
                  </option>
                ))}
              </select>
            </div>
            {/* Month */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <input
                type="month"
                name="month"
                value={filter.month}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="paidStatus"
                value={filter.paidStatus}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                {payrollEnums.paidStatus.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-700">
              Total Net Pay
            </h3>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {formatCurrency(totalNetPay)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-700">
              Total Deductions
            </h3>
            <p className="mt-2 text-2xl font-bold text-red-600">
              {formatCurrency(totalDeductions)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-700">
              Paid Records
            </h3>
            <p className="mt-2 text-2xl font-bold text-blue-600">{paidCount}</p>
          </div>
        </div>

        {/* Payroll Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          {loading && filteredPayrolls.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="flex justify-center mb-4">
                <TailSpin
                  height={40}
                  width={40}
                  color="#2563EB"
                  ariaLabel="loading"
                />
              </div>
              Loading payroll records...
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Pay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayrolls.map((payroll) => (
                  <tr key={payroll._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payroll.employee?.fullname || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatMonth(payroll.month)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(payroll.netPay || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payroll.paidStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2 text-sm font-medium">
                      <button
                        onClick={() => handleEdit(payroll)}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 flex items-center gap-1"
                      >
                        {loading && (
                          <TailSpin height={16} width={16} color="#2563EB" />
                        )}
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(payroll._id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 disabled:text-gray-400 flex items-center gap-1"
                      >
                        {loading && (
                          <TailSpin height={16} width={16} color="#DC2626" />
                        )}
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPayrolls.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No payroll records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <h2 className="text-2xl font-semibold mb-4">
              {editingPayroll ? "Edit Payroll" : "Add Payroll"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Employee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee
                </label>
                <select
                  required
                  name="employee"
                  value={formData.employee}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.fullname} - {emp.email}
                    </option>
                  ))}
                </select>
              </div>
              {/* Month */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <input
                  type="month"
                  required
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Basic Salary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Basic Salary
                </label>
                <input
                  type="number"
                  required
                  name="basicSalary"
                  value={formData.basicSalary}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Overtime Hours & Rate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overtime Hours
                  </label>
                  <input
                    type="number"
                    name="overtimeHours"
                    value={formData.overtimeHours}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overtime Rate
                  </label>
                  <input
                    type="number"
                    name="overtimeRate"
                    value={formData.overtimeRate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              {/* Deduction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deduction
                </label>
                <input
                  type="number"
                  name="deduction"
                  value={formData.deduction}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Pay Slip URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pay Slip URL
                </label>
                <input
                  type="url"
                  name="paySlipUrl"
                  value={formData.paySlipUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Paid Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paid Status
                </label>
                <select
                  name="paidStatus"
                  value={formData.paidStatus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {payrollEnums.paidStatus.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {payrollEnums.paymentMethod.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-4 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:text-gray-400 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 font-medium"
                >
                  {loading ? (
                    <>
                      <TailSpin height={20} width={20} color="#FFFFFF" />
                      {editingPayroll ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollPage;
