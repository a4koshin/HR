// services/recruitmentService.js
import api from "./axiosInstance";

export const getRecruitments = async () => {
  const response = await api.get("/recruitment");
  return response.data.recruitments || [];
};
//
export const getRecruitmentById = async (id) => {
  const response = await api.get(`/recruitment/${id}`);
  return response.data.recruitment;
};

export const createRecruitment = async (recruitmentData) => {
  const response = await api.post("/recruitment", recruitmentData);
  return response.data.recruitment;
};

export const updateRecruitment = async (id, recruitmentData) => {
  const response = await api.put(`/recruitment/${id}`, recruitmentData);
  return response.data.recruitment;
};

export const deleteRecruitment = async (id) => {
  const response = await api.delete(`/recruitment/${id}`);
  return response.data;
};

export const updateRecruitmentStatus = async (id, status) => {
  const response = await api.patch(`/recruitment/${id}/status`, { status });
  return response.data.recruitment;
};
