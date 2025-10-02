import { Navigate, Outlet, useLocation } from "react-router-dom";

export function PrivateRoute() {
  const location = useLocation();
  const token =
    typeof window !== "undefined" && localStorage.getItem("access_token");
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

export default PrivateRoute;
