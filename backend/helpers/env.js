import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const ENV_FILE_CANDIDATES = [".env.local", ".env"];

const REQUIRED_ENV_VARS = [
  "APPWRITE_ENDPOINT",
  "APPWRITE_PROJECT_ID",
  "APPWRITE_API_KEY_V2",
  "APPWRITE_DATABASE_ID",
  "APPWRITE_APPLICANTS_COLLECTION_ID",
  "APPWRITE_INTERVIEWS_COLLECTION_ID",
];

export const loadBackendEnv = () => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const backendRoot = join(__dirname, "..");

  for (const envFileName of ENV_FILE_CANDIDATES) {
    const envPath = join(backendRoot, envFileName);
    if (existsSync(envPath)) {
      loadEnv({ path: envPath, override: false });
    }
  }
};

export const getAppwriteConfigFromEnv = () => {
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

  return {
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_API_KEY_V2,
    APPWRITE_DATABASE_ID,
    APPWRITE_APPLICANTS_COLLECTION_ID,
    APPWRITE_INTERVIEWS_COLLECTION_ID,
  };
};

export const buildCorsOrigin = () => {
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
