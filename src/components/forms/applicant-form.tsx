"use client";

import { Button, DatePicker, Form, Input, InputNumber, Select } from "antd";
import dayjs from "dayjs";
import { APPLICANT_STATUSES, type Applicant } from "@/types/applicant";

interface ApplicantFormProps {
  initialValues?: Partial<Applicant>;
  onFinish: (values: Partial<Applicant>) => void;
  loading?: boolean;
}

export function ApplicantForm({ initialValues, onFinish, loading }: ApplicantFormProps) {
  return (
    <Form
      layout="vertical"
      onFinish={(values) =>
        onFinish({
          ...values,
          availableStartDate: values.availableStartDate?.format("YYYY-MM-DD"),
          skills: values.skills
            ?.split(",")
            .map((item: string) => item.trim())
            .filter(Boolean),
        })
      }
      initialValues={{
        ...initialValues,
        skills: initialValues?.skills?.join(", "),
        availableStartDate: initialValues?.availableStartDate
          ? dayjs(initialValues.availableStartDate)
          : undefined,
      }}
    >
      <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
        <Input />
      </Form.Item>
      <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="appliedRole" label="Applied Role" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item
        name="yearsOfExperience"
        label="Years of Experience"
        rules={[{ required: true, type: "number", min: 0 }]}
      >
        <InputNumber style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="status" label="Status" rules={[{ required: true }]}>
        <Select options={APPLICANT_STATUSES.map((status) => ({ label: status, value: status }))} />
      </Form.Item>
      <Form.Item
        name="expectedSalary"
        label="Expected Salary"
        rules={[{ required: true, type: "number", min: 0 }]}
      >
        <InputNumber style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        name="availableStartDate"
        label="Available Start Date"
        rules={[{ required: true }]}
      >
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        name="skills"
        label="Skills (comma separated)"
        rules={[{ required: true, message: "Please add at least one skill" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="notes" label="Notes">
        <Input.TextArea rows={4} />
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit" type="primary" loading={loading}>
          Save
        </Button>
      </Form.Item>
    </Form>
  );
}
