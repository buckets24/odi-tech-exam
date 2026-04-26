# Applicant Tracking Dashboard

Applicant Tracking Dashboard built with Refine + Next.js, with a Hono API backed by Appwrite.

## 1) Setup Instructions

### Prerequisites

- Node.js 18+
- npm
- An Appwrite project with database/collections ready for this app

### Install Dependencies

```bash
npm install
cd backend && npm install
```

### Run Locally

1. Create env files (examples below).
2. Start backend:

```bash
cd backend
npm run dev
```

3. Start frontend (from repo root):

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000).

## 2) Backend Setup (Appwrite Or Other)

### Appwrite (Primary Setup)

The backend API is implemented in [`backend/app.js`](backend/app.js) and expects these Appwrite variables:

- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY_V2`
- `APPWRITE_DATABASE_ID`
- `APPWRITE_APPLICANTS_COLLECTION_ID`
- `APPWRITE_INTERVIEWS_COLLECTION_ID`

Optional:

- `CORS_ORIGINS` (comma-separated exact origins; only needed for cross-origin browser calls)

### If Using Another Backend/Database

Keep the same REST response contract expected by Refine in [`src/providers/dataProvider.ts`](src/providers/dataProvider.ts):

- List endpoints should return `{ data: [...], total: number }`
- Single-item endpoints should return `{ data: {...} }`
- Query params should support `page`, `limit`, `sortBy`, `order` and existing filters

## 3) Environment Variables

### Local frontend (`.env.local` at repo root)

Required:

- `NEXT_PUBLIC_API_URL`

Recommended values:

- Split local frontend/backend: `NEXT_PUBLIC_API_URL=http://localhost:4000/api`
- Same-origin via Next route handler: `NEXT_PUBLIC_API_URL=http://localhost:3000/api`

### Local backend (`backend/.env.local` or `backend/.env`)

Required:

- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY_V2`
- `APPWRITE_DATABASE_ID`
- `APPWRITE_APPLICANTS_COLLECTION_ID`
- `APPWRITE_INTERVIEWS_COLLECTION_ID`

Optional:

- `CORS_ORIGINS`

### Vercel Variables

Set these in **Project Settings > Environment Variables**:

- Browser-exposed:
  - `NEXT_PUBLIC_API_URL` (recommended `/api` when frontend and backend are in the same Vercel project)
- Server-only:
  - `APPWRITE_ENDPOINT`
  - `APPWRITE_PROJECT_ID`
  - `APPWRITE_API_KEY_V2`
  - `APPWRITE_DATABASE_ID`
  - `APPWRITE_APPLICANTS_COLLECTION_ID`
  - `APPWRITE_INTERVIEWS_COLLECTION_ID`
  - `CORS_ORIGINS` (optional)

Apply server-only vars to at least Production and Preview environments.

## Quick Deploy Notes

- API is exposed under `/api` in the same deployment via [`src/app/api/[[...route]]/route.ts`](src/app/api/[[...route]]/route.ts).
- Use `NEXT_PUBLIC_API_URL=/api` for same-project Vercel deployments.

## Technical Expectations Checklist

### 1) Refine Usage

- [x] proper resources configuration
- [x] correct routing
- [x] reusable components

### 2) API Layer

- [x] clean data provider setup
- [x] separation of concerns
- [x] minimal hardcoding

### 3) State Handling

- [x] server state via Refine (React Query)
- [x] avoid unnecessary local state duplication

## Additional Technical Notes

For architecture, API integration approach, and challenges encountered, see [`docs/IMPLEMENTATION_NOTES.md`](docs/IMPLEMENTATION_NOTES.md).
