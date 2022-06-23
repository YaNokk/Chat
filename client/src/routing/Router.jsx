import React, { useContext } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AuthContext, AuthProvider } from "./AuthProvider";
import { Index } from "../pages/Index";
import { Login } from "../pages/Login";
import { Room } from "../pages/Room";
import { ConfigProvider } from "./ConfigProvider";
import { Profile } from "../pages/Profile";

export const Routing = () => {
  return (
    <BrowserRouter>
      <ConfigProvider>
        <AuthProvider>
          <Routes>
            <Route
              path={"/login"}
              element={
                <NotRequireAuth>
                  <Login />
                </NotRequireAuth>
              }
            />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Index />
                </RequireAuth>
              }
            />
            <Route
              path={`room/`}
              element={
                <RequireAuth>
                  <Room create />
                </RequireAuth>
              }
            />
            <Route
              path={`room/:id`}
              element={
                <RequireAuth>
                  <Room />
                </RequireAuth>
              }
            />
            <Route path={`profile/:id`} element={<Profile />} />
          </Routes>
        </AuthProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
};

const RequireAuth = ({ children }) => {
  const auth = useContext(AuthContext);
  const location = useLocation();
  if (auth.loading) {
    return "Loading";
  }
  if (!auth.isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const NotRequireAuth = ({ children }) => {
  const auth = useContext(AuthContext);
  if (auth.loading) {
    return "Loading";
  }
  if (auth.isAuth) {
    return <Navigate to="/" replace />;
  }

  return children;
};
