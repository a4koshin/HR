// services/shiftService.js
import api from "./axiosInstance";

export const getShifts = async () => {
  const response = await api.get("/shifts");
  return response.data.shifts;
};

export const getShiftById = async (id) => {
  const response = await api.get(`/shifts/${id}`);
  return response.data.shift;
};

export const createShift = async (shiftData) => {
  const response = await api.post("/shifts", shiftData);
  return response.data.shift;
};

export const updateShift = async (id, shiftData) => {
  const response = await api.put(`/shifts/${id}`, shiftData);
  return response.data.shift;
};

export const deleteShift = async (id) => {
  const response = await api.delete(`/shifts/${id}`);
  return response.data;
};
