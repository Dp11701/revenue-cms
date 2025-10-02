import { Layout, Menu, Typography } from "antd";
import { Outlet, Link, useLocation } from "react-router-dom";

const { Header, Content } = Layout;

export function AppLayout() {
  const location = useLocation();
  const selectedKey = location.pathname.startsWith("/projects")
    ? "/projects"
    : "/";

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between !bg-white !px-6 border-b">
        <Typography.Title level={4} className="!mb-0">
          Revenue CMS
        </Typography.Title>
        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={[{ key: "/", label: <Link to="/">Dashboard</Link> }]}
        />
      </Header>
      <Content className="p-6 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
}
