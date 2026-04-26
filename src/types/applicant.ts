export const APPLICANT_STATUSES = [
  "applied",
  "screening",
  "interview",
  "offer",
  "hired",
  "rejected",
] as const;

export type ApplicantStatus = (typeof APPLICANT_STATUSES)[number];

export interface Applicant {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  appliedRole: string;
  yearsOfExperience: number;
  status: ApplicantStatus;
  expectedSalary: number;
  availableStartDate: string;
  skills: string[];
  notes?: string;
  createdAt: string;
}
