"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "antd";
import { type AppRole, getCurrentRole } from "@/providers/authProvider";

const ROLE_STORAGE_KEY = "ats-dashboard-role";

export function RoleSwitcher() {
  const router = useRouter();
  const [role, setRole] = useState<AppRole>(() => getCurrentRole());

  return (
    <Select
      value={role}
      style={{ width: 150 }}
      options={[
        { value: "admin", label: "Admin" },
        { value: "recruiter", label: "Recruiter" },
        { value: "interviewer", label: "Interviewer" },
      ]}
      onChange={(value) => {
        const nextRole = value as AppRole;
        setRole(nextRole);
        localStorage.setItem(ROLE_STORAGE_KEY, nextRole);
        router.refresh();
      }}
    />
  );
}
