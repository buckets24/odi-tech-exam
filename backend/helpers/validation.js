const APPLICANT_REQUIRED_FIELDS = [
  "fullName",
  "email",
  "phone",
  "appliedRole",
  "yearsOfExperience",
  "status",
  "expectedSalary",
  "availableStartDate",
  "skills",
];

const INTERVIEW_REQUIRED_FIELDS = ["applicantId", "title", "scheduledAt", "interviewer", "mode"];

const isMissing = (value) => {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

const validateRequiredFields = (payload, fields) =>
  fields.filter((field) => isMissing(payload[field]));

export const validateApplicantPayload = (payload) => {
  const missing = validateRequiredFields(payload, APPLICANT_REQUIRED_FIELDS);
  if (missing.length > 0) {
    return `Missing required applicant field(s): ${missing.join(", ")}`;
  }
  if (!Array.isArray(payload.skills)) {
    return "Field 'skills' must be an array";
  }
  return null;
};

export const validateInterviewPayload = (payload) => {
  const missing = validateRequiredFields(payload, INTERVIEW_REQUIRED_FIELDS);
  if (missing.length > 0) {
    return `Missing required interview field(s): ${missing.join(", ")}`;
  }
  return null;
};
