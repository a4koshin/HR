import api from './axiosInstance'; 

export const getEmployees = async () => {
  const res = await api.get('/employees'); 
  return res.data.employees;
};

export const getDepartments = async () => {
  const res = await api.get('/departments');
  return res.data.departments || [];
};

export const createEmployee = async (employeeData) => {
  const res = await api.post('/employees', employeeData);
  return res.data.employee;
};

export const updateEmployee = async (id, employeeData) => {
  const res = await api.put(`/employees/${id}`, employeeData);
  return res.data.employee;
};

export const deleteEmployee = async (id) => {
  await api.delete(`/employees/${id}`);
};
