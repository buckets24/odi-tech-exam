"use client";

import type { AuthProvider } from "@refinedev/core";

export type AppRole = "admin" | "recruiter" | "interviewer";

const STORAGE_KEY = "ats-dashboard-role";
const DEFAULT_ROLE: AppRole = "admin";

const canUseLocalStorage = () => typeof window !== "undefined";

const getStoredRole = (): AppRole => {
  if (!canUseLocalStorage()) return DEFAULT_ROLE;
  const role = localStorage.getItem(STORAGE_KEY) as AppRole | null;
  return role ?? DEFAULT_ROLE;
};

export const authProvider: AuthProvider = {
  login: async (params) => {
    const role = (params?.role as AppRole | undefined) ?? "admin";
    if (canUseLocalStorage()) {
      localStorage.setItem(STORAGE_KEY, role);
    }
    return { success: true, redirectTo: "/" };
  },
  logout: async () => {
    if (canUseLocalStorage()) {
      localStorage.removeItem(STORAGE_KEY);
    }
    return { success: true, redirectTo: "/login" };
  },
  onError: async () => ({ error: undefined }),
  check: async () => {
    if (canUseLocalStorage()) {
      const role = localStorage.getItem(STORAGE_KEY);
      if (!role) {
        localStorage.setItem(STORAGE_KEY, DEFAULT_ROLE);
      }
    }

    return { authenticated: true };
  },
  getPermissions: async () => getStoredRole(),
  getIdentity: async () => {
    const role = getStoredRole();
    return {
      id: role,
      name: role[0].toUpperCase() + role.slice(1),
      role,
    };
  },
};

export const getCurrentRole = (): AppRole => {
  return getStoredRole();
};
