export interface Interview {
  id: string;
  applicantId: string;
  title: string;
  scheduledAt: string;
  interviewer: string;
  mode: "onsite" | "online" | "phone";
  notes?: string;
}
