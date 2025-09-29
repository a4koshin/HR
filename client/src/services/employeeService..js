import api from './axiosInstance'; 

export const getEmployees = async () => {
  const res = await api.get('/api/employees'); 
  return res.data.employees;
};

export const getDepartments = async () => {
  const res = await api.get('/api/departments');
  return res.data.departments || [];
};

export const createEmployee = async (employeeData) => {
  const res = await api.post('/api/employees', employeeData);
  return res.data.employee;
};

export const updateEmployee = async (id, employeeData) => {
  const res = await api.put(`/api/employees/${id}`, employeeData);
  return res.data.employee;
};

export const deleteEmployee = async (id) => {
  await api.delete(`/api/employees/${id}`);
};
