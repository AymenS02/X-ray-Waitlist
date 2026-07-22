import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

export const getQueue = () => {
  return API.get("/queue");
};

export const addPatient = (name: string) => {
  return API.post("/queue", {
    name,
  });
};

export const deletePatient = (id: string) => {
  return API.delete(`/queue/${id}`);
};

export const movePatientUp = (id: string) => {
  return API.patch(`/queue/${id}/up`);
};

export const movePatientDown = (id: string) => {
  return API.patch(`/queue/${id}/down`);
};