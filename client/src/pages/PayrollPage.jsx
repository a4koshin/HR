import React, { useState, useEffect } from "react";
import {
  getPayrolls,
  createPayroll,
  updatePayroll,
  deletePayroll,
} from "../services/payrollService";
import { getEmployees } from "../services/employeeService";

const PayrollPage = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState({
    employee: "",
    month: "",
    paidStatus: "",
  });
  const [formData, setFormData] = useState({
    employee: "",
    month: new Date().toISOString().slice(0, 7), // YYYY-MM format
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --- Utility Functions ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatMonth = (monthString) => {
    if (!monthString) return "N/A";
    try {
      const [year, month] = monthString.split("-");
      const date = new Date(year, month - 1);
      return date.toLocaleDateString("en-US", {
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
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          badgeStyles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  // --- Fetch Data ---
  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
  }, []);

  const fetchPayrolls = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPayrolls();

      const normalized = data.map((payroll) => {
        // Normalize employee data
        let employeeObj = {};
        if (payroll.employee) {
          if (typeof payroll.employee === "string") {
            employeeObj = employees.find(
              (emp) => emp._id === payroll.employee
            ) || {
              _id: payroll.employee,
              fullname: "Unknown Employee",
              email: "Unknown Email",
            };
          } else {
            employeeObj = payroll.employee;
          }
        }

        return {
          ...payroll,
          employee: employeeObj,
        };
      });

      setPayrolls(normalized);
    } catch (err) {
      console.error("Error fetching payrolls:", err);
      setError("Failed to fetch payroll records");
    } finally {
      setLoading(false);
    }
  };

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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const submissionData = {
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

      let apiResult;
      if (editingPayroll) {
        apiResult = await updatePayroll(editingPayroll._id, submissionData);
      } else {
        apiResult = await createPayroll(submissionData);
      }

      await fetchPayrolls();

      setSuccess(
        editingPayroll
          ? "Payroll record updated successfully!"
          : "Payroll record created successfully!"
      );

      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving payroll:", err);
      setError(err.response?.data?.message || "Failed to save payroll");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (payroll) => {
    setEditingPayroll(payroll);
    setFormData({
      employee: payroll.employee?._id || payroll.employee || "",
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
    try {
      setLoading(true);
      await deletePayroll(id);
      setPayrolls((prev) => prev.filter((payroll) => payroll._id !== id));
      setSuccess("Payroll record deleted successfully!");
    } catch (err) {
      console.error("Error deleting payroll:", err);
      setError("Failed to delete payroll record");
    } finally {
      setLoading(false);
    }
  };

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

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // --- Filtering & Stats ---
  const filteredPayrolls = Array.isArray(payrolls)
    ? payrolls.filter((payroll) => {
        const empMatch =
          !filter.employee ||
          payroll.employee?._id === filter.employee ||
          payroll.employee === filter.employee;
        const monthMatch = !filter.month || payroll.month === filter.month;
        const statusMatch =
          !filter.paidStatus || payroll.paidStatus === filter.paidStatus;
        return empMatch && monthMatch && statusMatch;
      })
    : [];

  const totalNetPay = filteredPayrolls.reduce(
    (sum, payroll) => sum + (payroll.netPay || 0),
    0
  );

  const totalDeductions = filteredPayrolls.reduce(
    (sum, payroll) => sum + (payroll.deduction || 0),
    0
  );

  const paidCount = filteredPayrolls.filter(
    (payroll) => payroll.paidStatus === "Paid"
  ).length;

  return (
    <div className="min-h-screen p-6">
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
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition duration-200"
          >
            {loading ? "Loading..." : "+ Add Payroll Record"}
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
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-700">
              Total Net Pay
            </h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">
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
            <h3 className="text-xl font-semibold text-gray-700">Paid</h3>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {paidCount}
            </p>
          </div>
        </div>

        {/* Payroll Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          {loading && (
            <div className="p-4 text-center">Loading payroll records...</div>
          )}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Basic Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Overtime Pay
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Deductions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Net Pay
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayrolls.map((payroll) => (
                <tr key={payroll._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payroll.employee?.fullname || "Unknown Employee"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {payroll.employee?.email || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatMonth(payroll.month)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatCurrency(payroll.basicSalary)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatCurrency(payroll.overtimePay)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatCurrency(payroll.deduction)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold">
                    {formatCurrency(payroll.netPay)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(payroll.paidStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payroll.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(payroll)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(payroll._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPayrolls.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No payroll records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Payroll Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingPayroll ? "Edit Payroll Record" : "Add Payroll Record"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee *
                    </label>
                    <select
                      name="employee"
                      value={formData.employee}
                      onChange={handleInputChange}
                      required
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Month *
                    </label>
                    <input
                      type="month"
                      name="month"
                      value={formData.month}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Basic Salary *
                    </label>
                    <input
                      type="number"
                      name="basicSalary"
                      value={formData.basicSalary}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Overtime Hours
                    </label>
                    <input
                      type="number"
                      name="overtimeHours"
                      value={formData.overtimeHours}
                      onChange={handleInputChange}
                      step="0.5"
                      min="0"
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
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deductions
                    </label>
                    <input
                      type="number"
                      name="deduction"
                      value={formData.deduction}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="paidStatus"
                      value={formData.paidStatus}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
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
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payslip URL
                  </label>
                  <input
                    type="url"
                    name="paySlipUrl"
                    value={formData.paySlipUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/payslip.pdf"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 font-medium"
                  >
                    {loading
                      ? "Saving..."
                      : editingPayroll
                      ? "Update Record"
                      : "Add Record"}
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

export default PayrollPage;
