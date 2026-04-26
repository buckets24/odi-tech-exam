"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useTable } from "@refinedev/antd";
import { Table, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { AppShell } from "@/components/app-shell";
import type { Interview } from "@/types/interview";

const PAGE_SIZE_OPTIONS = ["1", "2", "3"];

export default function InterviewsPage() {
  const { tableProps } = useTable<Interview>({
    resource: "interviews",
    pagination: { pageSize: 1 },
    sorters: { initial: [{ field: "scheduledAt", order: "asc" }] },
  });

  return (
    <AppShell>
      <Typography.Title level={3}>Interviews</Typography.Title>
      <Table
        {...tableProps}
        rowKey="id"
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
        }}
      >
        <Table.Column<Interview> dataIndex="title" title="Title" />
        <Table.Column<Interview> dataIndex="interviewer" title="Interviewer" />
        <Table.Column<Interview>
          dataIndex="scheduledAt"
          title="Scheduled At"
          sorter
          render={(value: string) => dayjs(value).format("MMM D, YYYY h:mm A")}
        />
        <Table.Column<Interview> dataIndex="mode" title="Mode" render={(value: string) => <Tag>{value}</Tag>} />
        <Table.Column<Interview>
          dataIndex="applicantId"
          title="Applicant"
          render={(value: string) => <Link href={`/applicants/${value}`}>View applicant</Link>}
        />
      </Table>
    </AppShell>
  );
}
