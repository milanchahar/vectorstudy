# VectorStudy

Adaptive AI exam planning with a Vite React frontend and an Express + Prisma backend.

## Runtime

Frontend:
- `npm run dev`
- `npm run build`
- `npm run preview`

Backend:
- `cd server && npm run dev`
- `cd server && npm run start`

## Environment

Copy `.env.example` and fill in the values you need for your environment.

Frontend:
- `VITE_API_BASE_URL` points the app at the backend API. In production it can be omitted if the frontend and API are served from the same origin under `/api`.
- `VITE_CLERK_PUBLISHABLE_KEY` is reserved for the live Clerk integration.
- `VITE_DEV_PORT` and `VITE_PREVIEW_PORT` control local Vite ports.
- `VITE_BUILD_SOURCEMAP` enables production sourcemaps when set to `true`.

Backend:
- `PORT` controls the Express server port.
- `CLIENT_URL` and `CLIENT_URLS` define allowed CORS origins.
- `JSON_BODY_LIMIT` controls the maximum JSON request size.
- `DATABASE_URL` points Prisma at PostgreSQL.
- `GEMINI_API_KEY` enables Gemini topic extraction.
- `YOUTUBE_API_KEY` enables YouTube tutorial lookup.

## Deployment Notes

- The frontend no longer hardcodes `localhost:4000`; use `VITE_API_BASE_URL` or same-origin `/api`.
- The backend accepts multiple allowed client origins through `CLIENT_URLS`.
- Vite production builds split heavier dependencies into separate chunks for better caching.
