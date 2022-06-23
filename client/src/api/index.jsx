import axios from "axios";

const baseConfig = {
  baseURL: process.env.REACT_APP_API,
};
const api = axios.create(baseConfig);

const authApi = axios.create({
  ...baseConfig,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
  return config;
});

authApi.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
  return config;
});

authApi.interceptors.response.use((response) => {
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }
});

export const request = async (type, path, data) => {
  try {
    return await api[type](path, data);
  } catch (e) {
    alert(e);
  }
};
export { api, authApi };
