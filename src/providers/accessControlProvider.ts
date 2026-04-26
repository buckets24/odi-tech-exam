"use client";

import type { AccessControlProvider } from "@refinedev/core";
import { getCurrentRole } from "./authProvider";

const canDeleteApplicant = (role: string) => role === "admin";
const canWriteApplicant = (role: string) => role === "admin" || role === "recruiter";

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action }) => {
    const role = getCurrentRole();

    if (resource === "applicants") {
      if (action === "delete") {
        return { can: canDeleteApplicant(role) };
      }
      if (["create", "edit"].includes(action)) {
        return { can: canWriteApplicant(role) };
      }
      return { can: true };
    }

    if (resource === "interviews") {
      if (action === "delete") {
        return { can: role === "admin" };
      }
      if (action === "create") {
        return { can: role !== "interviewer" };
      }
      return { can: true };
    }

    if (resource === "dashboard") {
      return { can: true };
    }

    return { can: false };
  },
};
