import { Query } from "node-appwrite";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const parseInteger = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.trunc(number) : fallback;
};

export const parsePagination = (query) => {
  const page = clamp(parseInteger(query.page, 1), 1, 100000);
  const limit = clamp(parseInteger(query.limit, 10), 1, 100);
  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
};

const normalizeSortOrder = (order) => {
  const normalized = String(order ?? "asc")
    .trim()
    .toLowerCase();
  if (["desc", "descend", "descending"].includes(normalized)) return "desc";
  return "asc";
};

export const parseSort = (query, allowedFields, fallbackField) => {
  const requestedField = String(query.sortBy ?? fallbackField).trim();
  const sortBy = allowedFields.includes(requestedField) ? requestedField : fallbackField;
  const order = normalizeSortOrder(query.order);
  return order === "desc" ? Query.orderDesc(sortBy) : Query.orderAsc(sortBy);
};
