// src/services/departmentService.js
import api from './axiosInstance';

// Get all departments
export const getDepartments = async () => {
  const res = await api.get('/departments');
  return res.data.departments || [];
};

// Create department
export const createDepartment = async (departmentData) => {
  const res = await api.post('/departments', departmentData);
  return res.data.department;
};

// Update department
export const updateDepartment = async (id, departmentData) => {
  const res = await api.put(`/departments/${id}`, departmentData);
  return res.data.department;
};

// Delete department
export const deleteDepartment = async (id) => {
  await api.delete(`/departments/${id}`);
};
