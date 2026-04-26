"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Layout, Menu, Space, Typography, theme } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const RoleSwitcher = dynamic(() => import("./role-switcher").then((mod) => mod.RoleSwitcher), {
  ssr: false,
});

const menuItems = [
  { key: "/", label: <Link href="/">Dashboard</Link> },
  { key: "/applicants", label: <Link href="/applicants">Applicants</Link> },
  { key: "/interviews", label: <Link href="/interviews">Interviews</Link> },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { token } = theme.useToken();
  const selectedKey = menuItems.find((item) => pathname.startsWith(item.key))?.key ?? "/";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider>
        <div style={{ color: "#fff", fontWeight: 700, padding: 16 }}>ATS Dashboard</div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]} items={menuItems} />
      </Sider>
      <Layout>
        <Header style={{ background: token.colorBgContainer }}>
          <Space style={{ float: "right" }}>
            <UserOutlined />
            <Typography.Text strong>Role</Typography.Text>
            <RoleSwitcher />
          </Space>
        </Header>
        <Content style={{ margin: 24 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
