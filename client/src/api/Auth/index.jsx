import { api, authApi } from "../index";

export const loginAction = async (userName, password) => {
  return await authApi.post("auth/login", { userName, password });
};

export const registrationAction = async (formData) => {
  return await authApi.post("auth/registration", formData);
};

export const checkAuthAction = async () => {
  return await api.get("auth/checkAuth");
};

export const logoutAction = () => {
  localStorage.removeItem("token");
};
