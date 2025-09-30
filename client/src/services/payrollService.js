// services/payrollService.js
import api from "./axiosInstance";

export const getPayrolls = async () => {
  const response = await api.get("/payrolls");
  return response.data.payrolls || [];
};

export const getPayrollById = async (id) => {
  const response = await api.get(`/payrolls/${id}`);
  return response.data.payroll;
};

export const createPayroll = async (payrollData) => {
  const response = await api.post("/payrolls", payrollData);
  return response.data.payroll;
};

export const updatePayroll = async (id, payrollData) => {
  const response = await api.put(`/payrolls/${id}`, payrollData);
  return response.data.payroll;
};

export const deletePayroll = async (id) => {
  const response = await api.delete(`/payrolls/${id}`);
  return response.data;
};

// You might also need employee service for dropdowns
export const getEmployees = async () => {
  const response = await api.get("/employees");
  return response.data.employees || [];
};
