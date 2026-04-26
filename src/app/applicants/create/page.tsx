"use client";

export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { useCan, useCreate, useNotification } from "@refinedev/core";
import { Alert, Card, Spin, Typography } from "antd";
import { AppShell } from "@/components/app-shell";
import { ApplicantForm } from "@/components/forms/applicant-form";
import type { Applicant } from "@/types/applicant";

export default function ApplicantCreatePage() {
  const router = useRouter();
  const { open } = useNotification();
  const { data: canCreate } = useCan({ resource: "applicants", action: "create" });
  const { mutate, mutation } = useCreate();

  if (!canCreate) {
    return (
      <AppShell>
        <Spin />
      </AppShell>
    );
  }

  if (!canCreate.can) {
    return (
      <AppShell>
        <Alert type="error" message="You do not have permission to create applicants." />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Card>
        <Typography.Title level={3}>Create Applicant</Typography.Title>
        <ApplicantForm
          loading={mutation.isPending}
          onFinish={(values) =>
            mutate(
              {
                resource: "applicants",
                values: values as Partial<Applicant>,
              },
              {
                onSuccess: () => {
                  open?.({
                    type: "success",
                    message: "Applicant created successfully",
                  });
                  router.push("/applicants");
                },
                onError: (error) => {
                  open?.({
                    type: "error",
                    message: "Failed to create applicant",
                    description: error?.message,
                  });
                },
              },
            )
          }
        />
      </Card>
    </AppShell>
  );
}
