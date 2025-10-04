import api from "./axiosInstance";

export const getLeaves = async () => {
  const response = await api.get("/leaves");
  return response.data;
};

export const getLeave = async (id) => {
  const response = await api.get(`/leaves/${id}`);
  return response.data;
};

export const createLeave = async (leaveData) => {
  const response = await api.post("/leaves", leaveData);
  return response.data;
};

export const updateLeaveStatus = async (id, statusData) => {
  const response = await api.patch(`/leaves/${id}/status`, statusData);
  return response.data;
};

export const deleteLeave = async (id) => {
  const response = await api.delete(`/leaves/${id}`);
  return response.data;
};
