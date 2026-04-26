export const getErrorMessage = (error, fallback) => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = error.message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
};

export const jsonError = (c, status, message) => c.json({ message }, status);

export const readJsonBody = async (c) => {
  try {
    return await c.req.json();
  } catch {
    return null;
  }
};
