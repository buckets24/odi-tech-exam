import { Hono } from "hono";
import { cors } from "hono/cors";
import { Client, Databases } from "node-appwrite";
import { getAppwriteConfigFromEnv, buildCorsOrigin, loadBackendEnv } from "./helpers/env.js";
import { registerApplicantRoutes } from "./routes/applicants.js";
import { registerInterviewRoutes } from "./routes/interviews.js";

loadBackendEnv();

export function createApp() {
  const {
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_API_KEY_V2,
    APPWRITE_DATABASE_ID,
    APPWRITE_APPLICANTS_COLLECTION_ID,
    APPWRITE_INTERVIEWS_COLLECTION_ID,
  } = getAppwriteConfigFromEnv();

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

  const routeContext = {
    APPWRITE_DATABASE_ID,
    APPWRITE_APPLICANTS_COLLECTION_ID,
    APPWRITE_INTERVIEWS_COLLECTION_ID,
  };

  registerApplicantRoutes(app, databases, routeContext);
  registerInterviewRoutes(app, databases, routeContext);

  return app;
}
