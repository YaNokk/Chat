import React, { createContext, useEffect, useState } from "react";
import {
  checkAuthAction,
  loginAction,
  logoutAction,
  registrationAction,
} from "../api/Auth";
import { useLocation, useNavigate } from "react-router-dom";
import { response_success } from "../constants";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    checkAuth();
  }, []);
  const login = async (userName, password) => {
    try {
      const response = await loginAction(userName, password);
      setIsAuth(true);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (e) {
      console.log(e);
    }
  };

  async function registration(formData) {
    try {
      const response = await registrationAction(formData);
      if (response.data.messages === response_success) {
        setIsAuth(true);
      }
    } catch (e) {
      console.log(e);
    }
  }

  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await checkAuthAction();
      if (response.data) {
        setIsAuth(true);
        setUser(response.data);
      }
      setLoading(false);
    } catch (e) {
      console.log(e);
    }
  };
  const logout = () => {
    try {
      logoutAction();
      setIsAuth(false);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuth, loading, login, logout, registration, user }}
    >
      {children}
    </AuthContext.Provider>
  );
};
