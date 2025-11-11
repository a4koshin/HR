import React, { useState, useEffect } from "react";
import { TailSpin } from "react-loader-spinner";
import {
  FiX,
  FiCheckCircle,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiClock,
  FiTrendingDown,
  FiFileText,
  FiCreditCard,
  FiBriefcase,
} from "react-icons/fi";
import {
  useCreateFuctionMutation,
  useUpdateFunctionMutation,
  useGetallFunctionQuery,
} from "../../store/DynamicApi";
import { toast } from "react-toastify";

const PayModel = ({ isOpen, onClose, onSave, payroll }) => {
  const [createPayroll, { isLoading: isCreating }] = useCreateFuctionMutation();
  const [updatePayroll, { isLoading: isUpdating }] =
    useUpdateFunctionMutation();
  const { data: employeesData = [] } = useGetallFunctionQuery({
    url: "/employees/all",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    employee: "",
    month: "",
    basicSalary: "",
    overtimeHours: "",
    overtimeRate: "",
    deduction: "",
    paySlipUrl: "",
    paidStatus: "Unpaid",
    paymentMethod: "Bank Transfer",
  });

  const isLoading = isCreating || isUpdating;
  const isEditing = !!payroll;

  const payrollEnums = {
    paidStatus: [
      { value: "Paid", label: "Paid" },
      { value: "Unpaid", label: "Unpaid" },
    ],
    paymentMethod: [
      { value: "Bank Transfer", label: "Bank Transfer" },
      { value: "Cash", label: "Cash" },
    ],
  };

  const employees = employeesData?.employees || [];

  // Calculate totals
  const overtimePay =
    (parseFloat(formData.overtimeHours) || 0) *
    (parseFloat(formData.overtimeRate) || 0);
  const grossPay = (parseFloat(formData.basicSalary) || 0) + overtimePay;
  const netPay = grossPay - (parseFloat(formData.deduction) || 0);

  useEffect(() => {
    if (payroll) {
      setFormData({
        employee: payroll.employee?._id || "",
        month: payroll.month || "",
        basicSalary: payroll.basicSalary || "",
        overtimeHours: payroll.overtimeHours || "",
        overtimeRate: payroll.overtimeRate || "",
        deduction: payroll.deduction || "",
        paySlipUrl: payroll.paySlipUrl || "",
        paidStatus: payroll.paidStatus || "Unpaid",
        paymentMethod: payroll.paymentMethod || "Bank Transfer",
      });
    } else {
      const today = new Date();
      const currentMonth = today.toISOString().slice(0, 7);
      setFormData({
        employee: "",
        month: currentMonth,
        basicSalary: "",
        overtimeHours: "",
        overtimeRate: "",
        deduction: "",
        paySlipUrl: "",
        paidStatus: "Unpaid",
        paymentMethod: "Bank Transfer",
      });
    }
    setCurrentStep(1);
  }, [payroll, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmployeeSelect = (e) => {
    const employeeId = e.target.value;
    const selectedEmployee = employees.find((emp) => emp._id === employeeId);

    setFormData((prev) => ({
      ...prev,
      employee: employeeId,
      basicSalary: selectedEmployee?.salary || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        basicSalary: parseFloat(formData.basicSalary),
        overtimeHours: parseFloat(formData.overtimeHours),
        overtimeRate: parseFloat(formData.overtimeRate),
        deduction: parseFloat(formData.deduction),
        grossPay: grossPay,
        netPay: netPay,
      };

      if (isEditing) {
        await updatePayroll({
          url: "payrolls",
          id: payroll._id,
          formData: payload,
        }).unwrap();
        toast.success("Payroll record updated successfully!");
      } else {
        await createPayroll({ url: "payrolls", formData: payload }).unwrap();
        toast.success("Payroll record updated successfully!");
      }

      onSave();
    } catch (error) {
      console.error("Error saving Payroll record:", error);
      const message =
        error?.data?.message ||
        "❌ Something went wrong while saving Payroll record.";
      toast.error(message);
    }
  };

  const nextStep = () => {
    if (isBasicInfoValid()) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const isBasicInfoValid = () => {
    return formData.employee && formData.month && formData.basicSalary;
  };

  const isPaymentInfoValid = () => {
    return true; // All payment fields are optional except basic info which is already validated
  };

  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
        {/* Header */}
        <div className="p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-blue-700">
                {isEditing ? "Edit Payroll" : "Create Payroll Record"}
              </h2>
              <p className="text-blue-800 mt-1">
                {isEditing
                  ? "Update employee payroll details"
                  : "Add new payroll record for employee"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-700 hover:bg-blue-100 hover:text-blue-500 p-2 rounded-xl transition duration-200"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= 1
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 text-gray-400"
                } transition duration-200`}
              >
                <FiUser className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-sm font-medium ${
                    currentStep >= 1 ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  Basic Info
                </span>
                <span className="text-xs text-gray-400">Step 1</span>
              </div>
            </div>

            <div className="flex-1 h-1 bg-gray-200 mx-4">
              <div
                className={`h-full bg-blue-600 transition-all duration-300 ${
                  currentStep >= 2 ? "w-full" : "w-0"
                }`}
              ></div>
            </div>

            <div className="flex items-center space-x-3">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= 2
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 text-gray-400"
                } transition duration-200`}
              >
                <FiDollarSign className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-sm font-medium ${
                    currentStep >= 2 ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  Payment Details
                </span>
                <span className="text-xs text-gray-400">Step 2</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FiUser className="w-4 h-4 text-blue-600" />
                      Employee *
                    </label>
                    <select
                      required
                      name="employee"
                      value={formData.employee}
                      onChange={handleEmployeeSelect}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    >
                      <option value="">Select Employee</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.fullname} - {emp.position}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FiCalendar className="w-4 h-4 text-blue-600" />
                      Pay Period *
                    </label>
                    <input
                      type="month"
                      required
                      name="month"
                      value={formData.month}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FiDollarSign className="w-4 h-4 text-blue-600" />
                      Basic Salary *
                    </label>
                    <input
                      type="number"
                      required
                      name="basicSalary"
                      value={formData.basicSalary}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="0.00"
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FiClock className="w-4 h-4 text-blue-600" />
                        Overtime Hours
                      </label>
                      <input
                        type="number"
                        name="overtimeHours"
                        value={formData.overtimeHours}
                        onChange={handleInputChange}
                        min="0"
                        step="0.5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FiDollarSign className="w-4 h-4 text-blue-600" />
                        Overtime Rate
                      </label>
                      <input
                        type="number"
                        name="overtimeRate"
                        value={formData.overtimeRate}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FiTrendingDown className="w-4 h-4 text-blue-600" />
                      Deductions
                    </label>
                    <input
                      type="number"
                      name="deduction"
                      value={formData.deduction}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Salary Preview */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Salary Preview
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Basic Salary:</span>
                        <span className="font-medium">
                          ${(parseFloat(formData.basicSalary) || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Overtime Pay:</span>
                        <span className="font-medium">
                          ${overtimePay.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Deductions:</span>
                        <span className="font-medium text-red-600">
                          -${(parseFloat(formData.deduction) || 0).toFixed(2)}
                        </span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-gray-900">Net Pay:</span>
                        <span className="text-green-600">
                          ${netPay.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isBasicInfoValid()}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  Continue
                  <FiCheckCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FiFileText className="w-4 h-4 text-blue-600" />
                      Pay Slip URL
                    </label>
                    <input
                      type="url"
                      name="paySlipUrl"
                      value={formData.paySlipUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="https://example.com/payslip.pdf"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FiDollarSign className="w-4 h-4 text-blue-600" />
                      Payment Status
                    </label>
                    <select
                      name="paidStatus"
                      value={formData.paidStatus}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    >
                      {payrollEnums.paidStatus.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FiCreditCard className="w-4 h-4 text-blue-600" />
                      Payment Method
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    >
                      {payrollEnums.paymentMethod.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Final Salary Summary */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">
                      Final Salary Summary
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Basic Salary:</span>
                        <span className="font-medium text-blue-900">
                          ${(parseFloat(formData.basicSalary) || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Overtime Pay:</span>
                        <span className="font-medium text-blue-900">
                          ${overtimePay.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Deductions:</span>
                        <span className="font-medium text-red-600">
                          -${(parseFloat(formData.deduction) || 0).toFixed(2)}
                        </span>
                      </div>
                      <hr className="my-2 border-blue-200" />
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-blue-900">Net Pay:</span>
                        <span className="text-green-600">
                          ${netPay.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!isPaymentInfoValid() || isLoading}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <TailSpin height={20} width={20} color="#FFFFFF" />
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : isEditing ? (
                    <>
                      Update Payroll
                      <FiCheckCircle className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Create Payroll
                      <FiCheckCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PayModel;
