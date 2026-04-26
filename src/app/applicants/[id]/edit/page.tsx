"use client";

export const dynamic = "force-dynamic";

import { useParams, useRouter } from "next/navigation";
import { useCan, useNotification, useOne, useUpdate } from "@refinedev/core";
import { Alert, Card, Spin, Typography } from "antd";
import { AppShell } from "@/components/app-shell";
import { ApplicantForm } from "@/components/forms/applicant-form";
import type { Applicant } from "@/types/applicant";

export default function ApplicantEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { open } = useNotification();
  const { data: canEdit } = useCan({ resource: "applicants", action: "edit" });
  const { result: applicant, query } = useOne<Applicant>({
    resource: "applicants",
    id: params.id,
  });
  const { mutate, mutation } = useUpdate();

  if (!canEdit?.can) {
    return (
      <AppShell>
        <Alert type="error" message="You do not have permission to edit applicants." />
      </AppShell>
    );
  }

  if (query.isLoading) {
    return (
      <AppShell>
        <Spin />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Card>
        <Typography.Title level={3}>Edit Applicant</Typography.Title>
        <ApplicantForm
          initialValues={applicant}
          loading={mutation.isPending}
          onFinish={(values) =>
            mutate(
              {
                resource: "applicants",
                id: params.id,
                values: values as Partial<Applicant>,
              },
              {
                onSuccess: () => {
                  open?.({ type: "success", message: "Applicant updated successfully" });
                  router.push("/applicants");
                },
                onError: (error) => {
                  open?.({
                    type: "error",
                    message: "Failed to update applicant",
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
