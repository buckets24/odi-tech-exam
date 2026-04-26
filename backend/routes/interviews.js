import { ID, Query } from "node-appwrite";
import { parsePagination, parseSort } from "../helpers/query.js";
import { getErrorMessage, jsonError, readJsonBody } from "../helpers/http.js";
import { validateInterviewPayload } from "../helpers/validation.js";

const withId = (document) => ({ id: document.$id, ...document });

export const registerInterviewRoutes = (app, databases, config) => {
  const { APPWRITE_DATABASE_ID, APPWRITE_INTERVIEWS_COLLECTION_ID } = config;

  app.get("/interviews", async (c) => {
    try {
      const query = c.req.query();
      const { limit, offset } = parsePagination(query);
      const sortQuery = parseSort(query, ["scheduledAt", "createdAt"], "scheduledAt");
      const queries = [Query.limit(limit), Query.offset(offset), sortQuery];
      if (query.applicantId) {
        queries.push(Query.equal("applicantId", [String(query.applicantId)]));
      }
      const result = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_INTERVIEWS_COLLECTION_ID,
        queries,
      );
      return c.json({
        data: result.documents.map(withId),
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
      return c.json({ data: withId(document) }, 201);
    } catch (error) {
      return jsonError(c, 400, getErrorMessage(error, "Failed to create interview"));
    }
  });
};
