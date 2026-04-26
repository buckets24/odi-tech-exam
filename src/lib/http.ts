type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
};

/** Backend routes live under `/api`; env often omits it (e.g. `http://localhost:4000`). */
function normalizeApiBaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (trimmed.endsWith("/api")) return trimmed;
  return `${trimmed}/api`;
}

const API_BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
);

export function getResolvedApiBaseUrl(): string {
  return API_BASE_URL;
}

const toAbsoluteUrl = (path: string) => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }
  return `${API_BASE_URL}${path}`;
};

const parseResponseBody = async (response: Response) => {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { method = "GET", body } = options;
  const isJsonBody = body !== undefined && body !== null;

  const response = await fetch(toAbsoluteUrl(path), {
    method,
    headers: isJsonBody ? { "Content-Type": "application/json" } : undefined,
    body: isJsonBody ? JSON.stringify(body) : undefined,
  });

  const parsed = await parseResponseBody(response);

  if (!response.ok) {
    const message =
      typeof parsed === "object" && parsed !== null && "message" in parsed
        ? String(parsed.message)
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return parsed as T;
};

export const httpClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
