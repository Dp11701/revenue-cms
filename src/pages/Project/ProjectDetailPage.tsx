import { useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Tabs } from "antd";
import { useProjectById } from "../../hooks/useProjects";
import { ProductTab } from "./ProductTab";
import { SettingsPage } from "../Settings/SettingsPage";
// Products tab is implemented as a separate component
function UsersTab() {
  return <div className="space-y-4">User management coming soon.</div>;
}
function TransactionsTab() {
  return <div className="space-y-4">Transactions coming soon.</div>;
}

export function ProjectDetailPage() {
  const { projectId } = useParams();
  useProjectById(projectId || "");
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const activeKey = (searchParams.get("tab") || "settings") as
    | "settings"
    | "products"
    | "users"
    | "transactions";

  return (
    <div className="">
      <Tabs
        size="large"
        animated
        tabBarGutter={24}
        tabBarStyle={{ display: "none" }}
        activeKey={activeKey}
        onChange={(key) => {
          navigate(`/projects/${projectId}?tab=${key}`);
        }}
        items={[
          { key: "settings", label: "Settings", children: <SettingsPage /> },
          {
            key: "products",
            label: "Products",
            children: projectId ? <ProductTab projectId={projectId} /> : null,
          },
          { key: "users", label: "Users", children: <UsersTab /> },
          {
            key: "transactions",
            label: "Transactions",
            children: <TransactionsTab />,
          },
        ]}
      />
    </div>
  );
}
