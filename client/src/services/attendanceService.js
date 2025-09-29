// services/attendanceService.js
import api from "./axiosInstance";

export const getAttendances = async () => {
  const response = await api.get("/attendance");
  return response.data.data || [];
};

export const getAttendanceById = async (id) => {
  const response = await api.get(`/attendance/${id}`);
  return response.data.data;
};

export const createAttendance = async (attendanceData) => {
  const response = await api.post("/attendance", attendanceData);
  return response.data.data;
};

export const updateAttendance = async (id, attendanceData) => {
  const response = await api.put(`/attendance/${id}`, attendanceData);
  return response.data.data;
};

export const deleteAttendance = async (id) => {
  const response = await api.delete(`/attendance/${id}`);
  return response.data;
};

export const markBulkAttendance = async (bulkData) => {
  const response = await api.post("/attendance/mark", bulkData);
  return response.data;
};
