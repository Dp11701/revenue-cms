import { Tabs } from "antd";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProjectsGrid } from "./ProjectsGrid";

export function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeKey = useMemo(() => {
    return location.pathname.startsWith("/admin") ? "admin" : "projects";
  }, [location.pathname]);

  return (
    <div className="space-y-6">
      <Tabs
        size="large"
        animated
        tabBarGutter={24}
        activeKey={activeKey}
        onChange={(key) => {
          if (key === "admin") navigate("/admin");
          else navigate("/");
        }}
        items={[
          { key: "projects", label: "Projects", children: <ProjectsGrid /> },
          {
            key: "admin",
            label: "Admin",
            children: (
              <div className="text-gray-500">Admin area coming soon.</div>
            ),
          },
        ]}
      />
    </div>
  );
}
