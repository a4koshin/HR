import api from "./axiosInstance";

export const getRecruitments = async () => {
  const response = await api.get("/recruitment");
  return response.data;
};

export const getRecruitment = async (id) => {
  const response = await api.get(`/recruitment/${id}`);
  return response.data;
};

export const createRecruitment = async (recruitmentData) => {
  const response = await api.post("/recruitment", recruitmentData);
  return response.data;
};

export const updateRecruitment = async (id, recruitmentData) => {
  const response = await api.put(`/recruitment/${id}`, recruitmentData);
  return response.data;
};

export const deleteRecruitment = async (id) => {
  const response = await api.delete(`/recruitment/${id}`);
  return response.data;
};

export const hireApplicant = async (id, hireData) => {
  const response = await api.post(`/recruitment/${id}/hire`, hireData);
  return response.data;
};