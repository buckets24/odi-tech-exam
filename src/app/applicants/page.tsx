"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCan } from "@refinedev/core";
import { useTable } from "@refinedev/antd";
import { Button, Input, Select, Space, Table, Tag, Typography } from "antd";
import { AppShell } from "@/components/app-shell";
import { APPLICANT_STATUSES, type Applicant } from "@/types/applicant";

export default function ApplicantsListPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>();
  const { data: canCreate } = useCan({ resource: "applicants", action: "create" });

  const filters = useMemo(() => {
    const values: Array<{ field: string; operator: "eq"; value: string }> = [];
    if (search) {
      values.push({ field: "q", operator: "eq", value: search });
    }
    if (status) {
      values.push({ field: "status", operator: "eq", value: status });
    }
    return values;
  }, [search, status]);

  const { tableProps } = useTable<Applicant>({
    resource: "applicants",
    syncWithLocation: true,
    filters: { permanent: filters },
    sorters: { initial: [{ field: "createdAt", order: "desc" }] },
    pagination: { pageSize: 10 },
  });

  return (
    <AppShell>
      <Space direction="vertical" size={16} style={{ display: "flex" }}>
        <Typography.Title level={3}>Applicants</Typography.Title>
        <Space>
          <Input.Search
            placeholder="Search by name/email/role"
            allowClear
            onSearch={setSearch}
            style={{ width: 280 }}
          />
          <Select
            allowClear
            placeholder="Filter by status"
            style={{ width: 180 }}
            options={APPLICANT_STATUSES.map((item) => ({ value: item, label: item }))}
            onChange={(value) => setStatus(value)}
          />
          {canCreate?.can && (
            <Button type="primary">
              <Link href="/applicants/create">Create Applicant</Link>
            </Button>
          )}
        </Space>
        <Table
          {...tableProps}
          rowKey="id"
        >
          <Table.Column<Applicant> dataIndex="fullName" title="Name" />
          <Table.Column<Applicant> dataIndex="email" title="Email" />
          <Table.Column<Applicant> dataIndex="appliedRole" title="Role" />
          <Table.Column<Applicant> dataIndex="yearsOfExperience" title="YOE" sorter />
          <Table.Column<Applicant>
            dataIndex="status"
            title="Status"
            render={(value: string) => <Tag>{value}</Tag>}
          />
          <Table.Column<Applicant>
            title="Actions"
            render={(_, record) => (
              <Space>
                <Link href={`/applicants/${record.id}`}>View</Link>
                <Link href={`/applicants/${record.id}/edit`}>Edit</Link>
              </Space>
            )}
          />
        </Table>
      </Space>
    </AppShell>
  );
}
