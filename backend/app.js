import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { Client, Databases, ID, Query } from "node-appwrite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_FILE_CANDIDATES = [".env.local", ".env"];

for (const envFileName of ENV_FILE_CANDIDATES) {
  const envPath = join(__dirname, envFileName);
  if (existsSync(envPath)) {
    loadEnv({ path: envPath, override: false });
  }
}

const REQUIRED_ENV_VARS = [
  "APPWRITE_ENDPOINT",
  "APPWRITE_PROJECT_ID",
  "APPWRITE_API_KEY_V2",
  "APPWRITE_DATABASE_ID",
  "APPWRITE_APPLICANTS_COLLECTION_ID",
  "APPWRITE_INTERVIEWS_COLLECTION_ID",
];

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

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const parseInteger = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.trunc(number) : fallback;
};

const parsePagination = (query) => {
  const page = clamp(parseInteger(query.page, 1), 1, 100000);
  const limit = clamp(parseInteger(query.limit, 10), 1, 100);
  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
};

const parseSort = (query) => {
  const sortBy = query.sortBy ?? "createdAt";
  const order = query.order === "desc" ? "desc" : "asc";
  return order === "desc" ? Query.orderDesc(sortBy) : Query.orderAsc(sortBy);
};

const getErrorMessage = (error, fallback) => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = error.message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
};

const jsonError = (c, status, message) => c.json({ message }, status);

const readJsonBody = async (c) => {
  try {
    return await c.req.json();
  } catch {
    return null;
  }
};

const isMissing = (value) => {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

const validateRequiredFields = (payload, fields) =>
  fields.filter((field) => isMissing(payload[field]));

const validateApplicantPayload = (payload) => {
  const missing = validateRequiredFields(payload, APPLICANT_REQUIRED_FIELDS);
  if (missing.length > 0) {
    return `Missing required applicant field(s): ${missing.join(", ")}`;
  }
  if (!Array.isArray(payload.skills)) {
    return "Field 'skills' must be an array";
  }
  return null;
};

const validateInterviewPayload = (payload) => {
  const missing = validateRequiredFields(payload, INTERVIEW_REQUIRED_FIELDS);
  if (missing.length > 0) {
    return `Missing required interview field(s): ${missing.join(", ")}`;
  }
  return null;
};

const buildCorsOrigin = () => {
  const explicit = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (explicit.length > 0) {
    return (origin) => {
      if (!origin) return explicit[0];
      return explicit.includes(origin) ? origin : null;
    };
  }
  // Reflect the browser Origin when present (localhost any port, Vercel previews, custom domains).
  // Hono passes "" when the Origin header is missing — use "*" so non-browser clients still work.
  return (origin) => (origin ? origin : "*");
};

export function createApp() {
  const missingEnvVars = REQUIRED_ENV_VARS.filter((name) => {
    const value = process.env[name];
    return !value || !value.trim();
  });

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missingEnvVars.join(", ")}`);
  }

  const {
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_API_KEY_V2,
    APPWRITE_DATABASE_ID,
    APPWRITE_APPLICANTS_COLLECTION_ID,
    APPWRITE_INTERVIEWS_COLLECTION_ID,
  } = process.env;

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY_V2);

  const databases = new Databases(client);

  const app = new Hono().basePath("/api");

  app.use(
    "*",
    cors({
      origin: buildCorsOrigin(),
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Accept", "Authorization"],
      maxAge: 86400,
    }),
  );

  app.get("/health", (c) => {
    return c.json({ ok: true });
  });

  app.get("/applicants", async (c) => {
    try {
      const query = c.req.query();
      const { limit, offset } = parsePagination(query);
      const queries = [Query.limit(limit), Query.offset(offset), parseSort(query)];
      if (query.status) queries.push(Query.equal("status", [String(query.status)]));
      if (query.q) queries.push(Query.search("searchText", String(query.q)));

      const result = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_APPLICANTS_COLLECTION_ID,
        queries,
      );
      return c.json({
        data: result.documents.map((document) => ({
          id: document.$id,
          ...document,
        })),
        total: result.total,
      });
    } catch (error) {
      return jsonError(c, 500, getErrorMessage(error, "Failed to fetch applicants"));
    }
  });

  app.get("/applicants/:id", async (c) => {
    try {
      const document = await databases.getDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_APPLICANTS_COLLECTION_ID,
        c.req.param("id"),
      );
      return c.json({ data: { id: document.$id, ...document } });
    } catch (error) {
      return jsonError(c, 404, getErrorMessage(error, "Applicant not found"));
    }
  });

  app.post("/applicants", async (c) => {
    const payload = await readJsonBody(c);
    if (!payload || typeof payload !== "object") {
      return jsonError(c, 400, "Invalid JSON payload");
    }

    const validationError = validateApplicantPayload(payload);
    if (validationError) {
      return jsonError(c, 400, validationError);
    }

    try {
      const documentPayload = { ...payload, createdAt: new Date().toISOString() };
      documentPayload.searchText =
        `${documentPayload.fullName ?? ""} ${documentPayload.email ?? ""} ${documentPayload.appliedRole ?? ""}`;
      const document = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_APPLICANTS_COLLECTION_ID,
        ID.unique(),
        documentPayload,
      );
      return c.json({ data: { id: document.$id, ...document } }, 201);
    } catch (error) {
      return jsonError(c, 400, getErrorMessage(error, "Failed to create applicant"));
    }
  });

  app.put("/applicants/:id", async (c) => {
    const payload = await readJsonBody(c);
    if (!payload || typeof payload !== "object") {
      return jsonError(c, 400, "Invalid JSON payload");
    }

    const validationError = validateApplicantPayload(payload);
    if (validationError) {
      return jsonError(c, 400, validationError);
    }

    try {
      const documentPayload = { ...payload };
      documentPayload.searchText =
        `${documentPayload.fullName ?? ""} ${documentPayload.email ?? ""} ${documentPayload.appliedRole ?? ""}`;
      const document = await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_APPLICANTS_COLLECTION_ID,
        c.req.param("id"),
        documentPayload,
      );
      return c.json({ data: { id: document.$id, ...document } });
    } catch (error) {
      return jsonError(c, 400, getErrorMessage(error, "Failed to update applicant"));
    }
  });

  app.delete("/applicants/:id", async (c) => {
    try {
      await databases.deleteDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_APPLICANTS_COLLECTION_ID,
        c.req.param("id"),
      );
      return c.json({ data: { id: c.req.param("id") } });
    } catch (error) {
      return jsonError(c, 400, getErrorMessage(error, "Failed to delete applicant"));
    }
  });

  app.get("/interviews", async (c) => {
    try {
      const query = c.req.query();
      const { limit, offset } = parsePagination(query);
      const queries = [Query.limit(limit), Query.offset(offset), parseSort(query)];
      if (query.applicantId) {
        queries.push(Query.equal("applicantId", [String(query.applicantId)]));
      }
      const result = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_INTERVIEWS_COLLECTION_ID,
        queries,
      );
      return c.json({
        data: result.documents.map((document) => ({
          id: document.$id,
          ...document,
        })),
        total: result.total,
      });
    } catch (error) {
      return jsonError(c, 500, getErrorMessage(error, "Failed to fetch interviews"));
    }
  });

  app.post("/interviews", async (c) => {
    const payload = await readJsonBody(c);
    if (!payload || typeof payload !== "object") {
      return jsonError(c, 400, "Invalid JSON payload");
    }

    const validationError = validateInterviewPayload(payload);
    if (validationError) {
      return jsonError(c, 400, validationError);
    }

    try {
      const document = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_INTERVIEWS_COLLECTION_ID,
        ID.unique(),
        payload,
      );
      return c.json({ data: { id: document.$id, ...document } }, 201);
    } catch (error) {
      return jsonError(c, 400, getErrorMessage(error, "Failed to create interview"));
    }
  });

  return app;
}
