"use client";

import { Button, DatePicker, Form, Input, Select } from "antd";
import type { Interview } from "@/types/interview";

interface InterviewFormProps {
  onFinish: (values: Partial<Interview>) => void;
  loading?: boolean;
}

export function InterviewForm({ onFinish, loading }: InterviewFormProps) {
  return (
    <Form
      layout="vertical"
      onFinish={(values) =>
        onFinish({
          ...values,
          scheduledAt: values.scheduledAt?.toISOString(),
        })
      }
    >
      <Form.Item name="title" label="Title" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="scheduledAt" label="Scheduled At" rules={[{ required: true }]}>
        <DatePicker showTime style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="interviewer" label="Interviewer" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="mode" label="Mode" rules={[{ required: true }]}>
        <Select
          options={[
            { value: "onsite", label: "Onsite" },
            { value: "online", label: "Online" },
            { value: "phone", label: "Phone" },
          ]}
        />
      </Form.Item>
      <Form.Item name="notes" label="Notes">
        <Input.TextArea rows={3} />
      </Form.Item>
      <Button htmlType="submit" type="primary" loading={loading}>
        Add Interview
      </Button>
    </Form>
  );
}
