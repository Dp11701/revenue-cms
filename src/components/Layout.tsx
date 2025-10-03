import {
  Layout as AntLayout,
  Menu,
  Avatar,
  Dropdown,
  Typography,
  Button,
  App,
} from "antd";
import {
  DashboardOutlined,
  AppstoreOutlined,
  SettingOutlined,
  UserOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { logoutCms } from "../api/auth";
import { useProjectById } from "../hooks/useProjects";

const { Header, Sider, Content } = AntLayout;

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [collapsed, setCollapsed] = useState(false);

  const isProjectDetail = useMemo(
    () => /^\/projects\/[^/]+/.test(location.pathname),
    [location.pathname]
  );

  const projectId = useMemo(() => {
    const match = location.pathname.match(/^\/projects\/([^/]+)/);
    return match?.[1];
  }, [location.pathname]);

  const { data: currentProject } = useProjectById(projectId || "");

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const projectTabKey = searchParams.get("tab") || "settings";

  const selectedKey = useMemo(() => {
    if (isProjectDetail) return projectTabKey;
    if (location.pathname.startsWith("/admin")) return "admin";
    if (location.pathname === "/") return "projects";
    return "dashboard";
  }, [isProjectDetail, projectTabKey, location.pathname]);

  const userMenu = (
    <Menu
      onClick={(info) => {
        if (info.key === "logout") {
          logoutCms();
          message.success("Signed out");
          navigate("/login", { replace: true });
        }
      }}
      items={[
        { key: "profile", label: "Profile" },
        { key: "logout", danger: true, label: "Logout" },
      ]}
    />
  );

  return (
    <AntLayout className="min-h-screen bg-gray-50">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        width={240}
      >
        <div className="h-14 flex items-center px-4 text-white text-base font-semibold tracking-wide">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary"></span>
            {collapsed ? "RC" : "Revenue CMS"}
          </span>
        </div>
        {isProjectDetail ? (
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={[
              {
                key: "settings",
                icon: <SettingOutlined />,
                label: (
                  <Link to={`/projects/${projectId}?tab=settings`}>
                    Settings
                  </Link>
                ),
              },
              {
                key: "products",
                icon: <AppstoreOutlined />,
                label: (
                  <Link to={`/projects/${projectId}?tab=products`}>
                    Products
                  </Link>
                ),
              },
              {
                key: "users",
                icon: <UserOutlined />,
                label: (
                  <Link to={`/projects/${projectId}?tab=users`}>Users</Link>
                ),
              },
              {
                key: "transactions",
                icon: <DashboardOutlined />,
                label: (
                  <Link to={`/projects/${projectId}?tab=transactions`}>
                    Transactions
                  </Link>
                ),
              },
            ]}
          />
        ) : (
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={[
              {
                key: "projects",
                icon: <AppstoreOutlined />,
                label: <Link to="/">Projects</Link>,
              },
              {
                key: "admin",
                icon: <SettingOutlined />,
                label: <Link to="/admin">Admin</Link>,
              },
            ]}
          />
        )}
      </Sider>
      <AntLayout>
        <Header className="flex items-center justify-between sticky top-0 z-30 !bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 !px-6 border-b shadow-sm">
          <div className="flex items-center gap-3">
            {isProjectDetail && (
              <Link to="/">
                <Button icon={<LeftOutlined />}></Button>
              </Link>
            )}
            <Typography.Title level={4} className="!mb-0">
              {isProjectDetail
                ? (() => {
                    const tabLabel =
                      projectTabKey === "products" ? "product" : projectTabKey;
                    const projectName = currentProject?.name || "Project";
                    return `${projectName}/${tabLabel}`;
                  })()
                : selectedKey === "projects"
                ? "Projects"
                : selectedKey === "admin"
                ? "Admin"
                : "Dashboard"}
            </Typography.Title>
          </div>
          <Dropdown
            overlay={userMenu}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Avatar className="cursor-pointer" icon={<UserOutlined />} />
          </Dropdown>
        </Header>
        <Content className="p-6 h-[calc(100vh-64px)] overflow-auto">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
