"use client";

import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router/app";
import { useNotificationProvider } from "@refinedev/antd";
import { accessControlProvider } from "@/providers/accessControlProvider";
import { authProvider } from "@/providers/authProvider";
import { dataProvider } from "@/providers/dataProvider";

export function RefineProvider({ children }: { children: React.ReactNode }) {
  const notificationProvider = useNotificationProvider();

  return (
    <Refine
      routerProvider={routerProvider}
      dataProvider={dataProvider}
      notificationProvider={notificationProvider}
      authProvider={authProvider}
      accessControlProvider={accessControlProvider}
      resources={[
        {
          name: "dashboard",
          list: "/",
        },
        {
          name: "applicants",
          list: "/applicants",
          create: "/applicants/create",
          edit: "/applicants/:id/edit",
          show: "/applicants/:id",
        },
        {
          name: "interviews",
          list: "/interviews",
          create: "/interviews/create",
        },
      ]}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
        projectId: "ats-dashboard",
        disableTelemetry: true,
      }}
    >
      {children}
    </Refine>
  );
}
