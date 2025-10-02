import { createBrowserRouter } from "react-router-dom";
import { Layout } from "../components/Layout";
import { DashboardPage } from "../pages/Dashboard/DashboardPage";
import { ProjectDetailPage } from "../pages/Project/ProjectDetailPage";
import { PrivateRoute } from "./PrivateRoute";
import { LoginPage } from "../pages/Auth/LoginPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <PrivateRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "admin", element: <DashboardPage /> },
          { path: "projects/:projectId", element: <ProjectDetailPage /> },
        ],
      },
    ],
  },
]);
