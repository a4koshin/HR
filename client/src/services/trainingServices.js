import api from "./axiosInstance";

export const getTrainings = async () => {
  const response = await api.get("/trainings");
  return response.data;
};

export const getTraining = async (id) => {
  const response = await api.get(`/trainings/${id}`);
  return response.data;
};

export const createTraining = async (trainingData) => {
  const response = await api.post("/trainings", trainingData);
  return response.data;
};

export const updateTraining = async (id, trainingData) => {
  const response = await api.put(`/trainings/${id}`, trainingData);
  return response.data;
};

export const deleteTraining = async (id) => {
  const response = await api.delete(`/trainings/${id}`);
  return response.data;
};
