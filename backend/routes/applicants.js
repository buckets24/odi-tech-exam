import { ID, Query } from "node-appwrite";
import { parsePagination, parseSort } from "../helpers/query.js";
import { getErrorMessage, jsonError, readJsonBody } from "../helpers/http.js";
import { validateApplicantPayload } from "../helpers/validation.js";

const withId = (document) => ({ id: document.$id, ...document });

const buildApplicantPayload = (payload, includeCreatedAt = false) => {
  const documentPayload = includeCreatedAt
    ? { ...payload, createdAt: new Date().toISOString() }
    : { ...payload };

  documentPayload.searchText =
    `${documentPayload.fullName ?? ""} ${documentPayload.email ?? ""} ${documentPayload.appliedRole ?? ""}`;

  return documentPayload;
};

export const registerApplicantRoutes = (app, databases, config) => {
  const { APPWRITE_DATABASE_ID, APPWRITE_APPLICANTS_COLLECTION_ID } = config;

  app.get("/applicants", async (c) => {
    try {
      const query = c.req.query();
      const { limit, offset } = parsePagination(query);
      const sortQuery = parseSort(query, ["createdAt", "yearsOfExperience"], "createdAt");
      const queries = [Query.limit(limit), Query.offset(offset), sortQuery];
      if (query.status) queries.push(Query.equal("status", [String(query.status)]));
      if (query.q) queries.push(Query.search("searchText", String(query.q)));

      const result = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_APPLICANTS_COLLECTION_ID,
        queries,
      );
      return c.json({
        data: result.documents.map(withId),
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
      return c.json({ data: withId(document) });
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
      const documentPayload = buildApplicantPayload(payload, true);
      const document = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_APPLICANTS_COLLECTION_ID,
        ID.unique(),
        documentPayload,
      );
      return c.json({ data: withId(document) }, 201);
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
      const documentPayload = buildApplicantPayload(payload);
      const document = await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_APPLICANTS_COLLECTION_ID,
        c.req.param("id"),
        documentPayload,
      );
      return c.json({ data: withId(document) });
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
};
