# Implementation Notes

## 1) Architecture

- Frontend uses Next.js App Router with Refine and Ant Design for resource-driven pages.
- Backend uses Hono in [`backend/app.js`](../backend/app.js) for REST endpoints.
- Same backend app is reused in two runtimes:
  - local Node server via [`backend/server.js`](../backend/server.js)
  - Next.js route handler via [`src/app/api/[[...route]]/route.ts`](../src/app/api/[[...route]]/route.ts)
- Data persists in Appwrite Databases/Collections through `node-appwrite`.

## 2) API Integration Approach

- Frontend HTTP base URL is configured by `NEXT_PUBLIC_API_URL` in [`src/lib/http.ts`](../src/lib/http.ts).
- Refine hooks (`useList`, `useTable`, `useCreate`, etc.) call a centralized data provider in [`src/providers/dataProvider.ts`](../src/providers/dataProvider.ts).
- The data provider maps Refine contracts to query params (`page`, `limit`, `sortBy`, `order`, filters) and normalizes API responses back to `{ data, total }` or `{ data }`.
- Backend validates required payload fields and supports pagination/sorting/filtering on list endpoints.

## 3) Challenges Encountered

- Aligning Refine table/list pagination and sorter state with backend query expectations.
- Ensuring sorting remains robust across different sort token formats (`asc`, `ascend`, `descend`, etc.).
- Keeping UI sortable fields aligned with backend/Appwrite-supported sort fields to avoid no-op sorting behavior.
- Maintaining one code path that works both locally and on Vercel while keeping server-only secrets out of client bundles.

## 4) Technical Expectations Checklist

### 1. Refine Usage

- [x] proper resources configuration
- [x] correct routing
- [x] reusable components

### 2. API Layer

- [x] clean data provider setup
- [x] separation of concerns
- [x] minimal hardcoding

### 3. State Handling

- [x] server state via Refine (React Query)
- [x] avoid unnecessary local state duplication
