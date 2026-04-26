"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCan, useDelete, useList, useNotification, useOne, useCreate } from "@refinedev/core";
import { Alert, Button, Card, Descriptions, List, Popconfirm, Space, Spin, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { AppShell } from "@/components/app-shell";
import { InterviewForm } from "@/components/forms/interview-form";
import type { Applicant } from "@/types/applicant";
import type { Interview } from "@/types/interview";

export default function ApplicantShowPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { open } = useNotification();
  const { data: canDelete } = useCan({ resource: "applicants", action: "delete" });
  const { data: canCreateInterview } = useCan({ resource: "interviews", action: "create" });
  const { result: applicant, query } = useOne<Applicant>({
    resource: "applicants",
    id: params.id,
  });
  const { result: interviewsResult, query: interviewQuery } = useList<Interview>({
    resource: "interviews",
    filters: [{ field: "applicantId", operator: "eq", value: params.id }],
    sorters: [{ field: "scheduledAt", order: "asc" }],
    pagination: { pageSize: 20 },
  });
  const { mutate: deleteApplicant, mutation: deleteMutation } = useDelete();
  const { mutate: createInterview, mutation: createMutation } = useCreate();

  if (query.isLoading) {
    return (
      <AppShell>
        <Spin />
      </AppShell>
    );
  }

  if (!applicant) {
    return (
      <AppShell>
        <Alert type="error" message="Applicant not found" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Space direction="vertical" size={16} style={{ display: "flex" }}>
        <Card>
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {applicant.fullName}
            </Typography.Title>
            <Space>
              <Button>
                <Link href={`/applicants/${params.id}/edit`}>Edit</Link>
              </Button>
              {canDelete?.can && (
                <Popconfirm
                  title="Delete applicant?"
                  onConfirm={() =>
                    deleteApplicant(
                      { resource: "applicants", id: params.id },
                      {
                        onSuccess: () => {
                          open?.({ type: "success", message: "Applicant deleted" });
                          router.push("/applicants");
                        },
                      },
                    )
                  }
                >
                  <Button danger loading={deleteMutation.isPending}>
                    Delete
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </Space>
          <Descriptions column={2} style={{ marginTop: 16 }}>
            <Descriptions.Item label="Email">{applicant.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{applicant.phone}</Descriptions.Item>
            <Descriptions.Item label="Applied Role">{applicant.appliedRole}</Descriptions.Item>
            <Descriptions.Item label="Experience">{applicant.yearsOfExperience} years</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag>{applicant.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Expected Salary">{applicant.expectedSalary}</Descriptions.Item>
            <Descriptions.Item label="Available Start Date">{applicant.availableStartDate}</Descriptions.Item>
            <Descriptions.Item label="Created At">
              {dayjs(applicant.createdAt).format("MMM D, YYYY h:mm A")}
            </Descriptions.Item>
            <Descriptions.Item label="Skills" span={2}>
              <Space wrap>
                {applicant.skills.map((skill) => (
                  <Tag key={skill}>{skill}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Notes" span={2}>
              {applicant.notes || "-"}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Related Interviews" loading={interviewQuery.isLoading}>
          <List
            dataSource={interviewsResult?.data ?? []}
            renderItem={(interview) => (
              <List.Item>
                <Space direction="vertical" size={0}>
                  <Typography.Text strong>{interview.title}</Typography.Text>
                  <Typography.Text>
                    {dayjs(interview.scheduledAt).format("MMM D, YYYY h:mm A")} - {interview.mode}
                  </Typography.Text>
                </Space>
              </List.Item>
            )}
          />
        </Card>

        {canCreateInterview?.can && (
          <Card title="Schedule Interview">
            <InterviewForm
              loading={createMutation.isPending}
              onFinish={(values) =>
                createInterview(
                  {
                    resource: "interviews",
                    values: {
                      ...values,
                      applicantId: params.id,
                    },
                  },
                  {
                    onSuccess: () => {
                      open?.({ type: "success", message: "Interview scheduled" });
                      router.refresh();
                    },
                    onError: (error) =>
                      open?.({
                        type: "error",
                        message: "Failed to schedule interview",
                        description: error?.message,
                      }),
                  },
                )
              }
            />
          </Card>
        )}
      </Space>
    </AppShell>
  );
}
