"use client";

import type { DataProvider, CrudFilters, CrudSorting } from "@refinedev/core";
import { getResolvedApiBaseUrl, httpClient } from "@/lib/http";

const buildQuery = (
  pagination?: { current?: number; pageSize?: number },
  filters?: CrudFilters,
  sorters?: CrudSorting,
) => {
  const params = new URLSearchParams();

  if (pagination?.current) {
    params.set("page", String(pagination.current));
  }
  if (pagination?.pageSize) {
    params.set("limit", String(pagination.pageSize));
  }

  const firstSorter = sorters?.[0];
  if (firstSorter?.field && firstSorter.order) {
    params.set("sortBy", String(firstSorter.field));
    params.set("order", firstSorter.order === "desc" ? "desc" : "asc");
  }

  filters?.forEach((filter) => {
    if ("field" in filter && filter.value !== undefined && filter.value !== null) {
      if (filter.field === "q") {
        params.set("q", String(filter.value));
      } else {
        params.set(String(filter.field), String(filter.value));
      }
    }
  });

  return params.toString();
};

const normalizeListResponse = (response: unknown) => {
  const payload = response as
    | { data?: unknown[]; total?: number }
    | { items?: unknown[]; total?: number }
    | unknown[];

  if (Array.isArray(payload)) {
    return { data: payload, total: payload.length };
  }

  if ("data" in payload && Array.isArray(payload.data)) {
    return { data: payload.data, total: payload.total ?? payload.data.length };
  }

  if ("items" in payload && Array.isArray(payload.items)) {
    return { data: payload.items, total: payload.total ?? payload.items.length };
  }

  return { data: [], total: 0 };
};

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters }) => {
    const query = buildQuery(pagination, filters, sorters);
    const url = query ? `/${resource}?${query}` : `/${resource}`;
    const response = await httpClient.get<unknown>(url);
    const normalized = normalizeListResponse(response);
    return {
      data: normalized.data as never[],
      total: normalized.total,
    } as never;
  },
  getOne: async ({ resource, id }) => {
    const response = await httpClient.get<{ data?: unknown } | unknown>(`/${resource}/${id}`);
    return {
      data: (typeof response === "object" && response !== null && "data" in response
        ? response.data
        : response) as never,
    } as never;
  },
  create: async ({ resource, variables }) => {
    const response = await httpClient.post<{ data?: unknown } | unknown>(`/${resource}`, variables);
    return {
      data: (typeof response === "object" && response !== null && "data" in response
        ? response.data
        : response) as never,
    } as never;
  },
  update: async ({ resource, id, variables }) => {
    const response = await httpClient.put<{ data?: unknown } | unknown>(`/${resource}/${id}`, variables);
    return {
      data: (typeof response === "object" && response !== null && "data" in response
        ? response.data
        : response) as never,
    } as never;
  },
  deleteOne: async ({ resource, id }) => {
    const response = await httpClient.delete<{ data?: unknown } | unknown>(`/${resource}/${id}`);
    return {
      data: (typeof response === "object" && response !== null && "data" in response
        ? (response.data ?? { id })
        : (response ?? { id })) as never,
    } as never;
  },
  getApiUrl: () => getResolvedApiBaseUrl(),
};
