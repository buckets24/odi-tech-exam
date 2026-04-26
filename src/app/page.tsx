"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { Card, Col, List, Row, Space, Statistic, Tag, Typography } from "antd";
import { useList } from "@refinedev/core";
import dayjs from "dayjs";
import { AppShell } from "@/components/app-shell";
import type { Applicant } from "@/types/applicant";
import type { Interview } from "@/types/interview";

export default function DashboardPage() {
  const { result: applicantsResult, query: applicantsQuery } = useList<Applicant>({
    resource: "applicants",
    pagination: { pageSize: 100 },
    sorters: [{ field: "createdAt", order: "desc" }],
  });
  const { result: interviewsResult, query: interviewsQuery } = useList<Interview>({
    resource: "interviews",
    pagination: { pageSize: 20 },
    sorters: [{ field: "scheduledAt", order: "asc" }],
  });

  const applicantItems = applicantsResult?.data ?? [];
  const interviewItems = interviewsResult?.data ?? [];
  const statusCount = applicantItems.reduce<Record<string, number>>((acc, applicant) => {
    acc[applicant.status] = (acc[applicant.status] ?? 0) + 1;
    return acc;
  }, {});

  console.log(applicantItems, "applicantItems");
  console.log(interviewItems, "interviewItems");

  return (
    <AppShell>
      <Space direction="vertical" size={16} style={{ display: "flex" }}>
        <Typography.Title level={3}>Dashboard</Typography.Title>
        <Row gutter={16}>
          <Col span={8}>
            <Card loading={applicantsQuery.isLoading}>
              <Statistic title="Total Applicants" value={applicantsResult?.total ?? applicantItems.length} />
            </Card>
          </Col>
          <Col span={8}>
            <Card loading={applicantsQuery.isLoading}>
              <Statistic title="Statuses Tracked" value={Object.keys(statusCount).length} />
            </Card>
          </Col>
          <Col span={8}>
            <Card loading={interviewsQuery.isLoading}>
              <Statistic title="Upcoming Interviews" value={interviewItems.length} />
            </Card>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Card title="Applicants per status">
              <Space wrap>
                {Object.entries(statusCount).map(([status, count]) => (
                  <Tag key={status}>
                    {status}: {count}
                  </Tag>
                ))}
              </Space>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Recent applicants">
              <List
                dataSource={applicantItems.slice(0, 5)}
                renderItem={(item) => (
                  <List.Item>
                    <Link href={`/applicants/${item.id}`}>{item.fullName}</Link>
                    <Tag>{item.status}</Tag>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
        <Card title="Upcoming interviews">
          <List
            dataSource={interviewItems.slice(0, 5)}
            renderItem={(item) => (
              <List.Item>
                <Link href={`/applicants/${item.applicantId}`}>{item.title}</Link>
                <Typography.Text>{dayjs(item.scheduledAt).format("MMM D, YYYY h:mm A")}</Typography.Text>
              </List.Item>
            )}
          />
        </Card>
      </Space>
    </AppShell>
  );
}
