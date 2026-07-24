# AI-Powered API Testing & Mocking Platform

Upload an OpenAPI or Swagger specification and get a working mock API with realistic response data. The platform gives developers a fast way to build and test against APIs before a production service is ready.

## The problem it solves

Frontend and client developers often need to integrate with an API that is incomplete, unavailable, or still being designed. Writing temporary mock servers and realistic sample data by hand is slow, fragile, and difficult to keep aligned with an API contract.

This platform turns an uploaded API specification into live mock endpoints. It uses the response schema to generate data, optionally enhances the output with OpenAI, and remains reliable by falling back to a local realistic-data generator whenever the AI service is unavailable.

## What I built

- Upload OpenAPI 3.0 and Swagger 2.0 JSON files by drag-and-drop or by pasting JSON.
- Persist API schemas in PostgreSQL using Sequelize and JSONB.
- List, search, and inspect all uploaded schemas and their parsed endpoints.
- Serve dynamic mock APIs at `/mock/:schemaId/*`.
- Match templated paths, so `/pets/{petId}` works with `/pets/123`.
- Validate request methods and return `405 Method Not Allowed` with an `Allow` header when needed.
- Resolve schema references and select useful successful responses.
- Infer Pet Store-style response models when an incomplete specification omits a success schema.
- Generate context-aware mock data through OpenAI when configured, with a five-second timeout.
- Fall back immediately to a zero-dependency realistic data generator if OpenAI is missing, fails, times out, or returns invalid JSON.
- Provide a responsive React UI with dark mode, mobile navigation, notifications, copy actions, an endpoint tester, and a collapsible JSON viewer.

## Architecture

```text
React + Vite + Tailwind
        │ Upload OpenAPI JSON / test mock endpoints
        ▼
Node.js + Express API
        │
        ├── PostgreSQL 15 (stores schemas as JSONB)
        ├── OpenAI API (optional contextual mock generation)
        └── Local mock generator (reliable fallback)
        │
        ▼
GET /mock/:schemaId/{endpoint-path}
```

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, Tailwind CSS, React Router, Lucide |
| Backend | Node.js, Express, Sequelize |
| Database | PostgreSQL 15, Docker Compose, JSONB |
| AI | OpenAI API (optional) |
| Deployment | Render (backend) and Vercel (frontend) |

## Key technical decisions

| Decision | Why it matters |
| --- | --- |
| Dynamic mock routing | Every uploaded schema becomes a usable mock API without writing new server routes. |
| AI with a five-second timeout | AI improves realism without allowing an upstream service to block mock responses. |
| Local fallback generator | The core product remains functional without an OpenAI key or network access. |
| Smart response inference | Incomplete specifications such as Swagger Pet Store still produce useful responses. |
| PostgreSQL JSONB | Stores flexible API contracts while retaining database-backed persistence. |
| Docker Compose for PostgreSQL | Gives contributors a consistent local database with minimal setup. |

## Run locally

Prerequisites: Node.js 18+ and Docker.

```bash
# Start PostgreSQL
docker compose up -d

# Start the backend
cd backend
cp .env.example .env
npm install
npm run dev

# In another terminal, start the frontend
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. The backend runs at <http://localhost:5000> and exposes a health check at <http://localhost:5000/health>.

## Environment variables

Create `backend/.env` from `.env.example` and set the values for your environment.

| Variable | Description |
| --- | --- |
| `PORT` | Backend port; defaults to `5000`. |
| `DB_HOST`, `DB_PORT` | PostgreSQL host and port. |
| `DB_NAME`, `DB_USER`, `DB_PASS` | PostgreSQL database credentials. |
| `OPENAI_API_KEY` | Optional key for AI-generated mock data. The local generator is used when omitted or unavailable. |
| `VITE_API_URL` | Frontend URL of the deployed backend, for example `https://your-api.onrender.com`. |

## Deployment

### Backend: Render

1. Create a PostgreSQL database in Render (or use another managed PostgreSQL provider).
2. Create a Render **Web Service** from this repository.
3. Set the root directory to `backend` and use the included `backend/Dockerfile`.
4. Add `NODE_ENV=production`, the `DB_*` settings, and optionally `OPENAI_API_KEY`.
5. Set the health-check path to `/health`, then deploy.

### Frontend: Vercel

1. Import this repository in Vercel.
2. Set the root directory to `frontend` and select the Vite framework preset.
3. Add `VITE_API_URL` with the deployed Render backend URL.
4. Deploy.

After deployment, update the backend CORS policy if you want to restrict it to the Vercel domain.

## Project structure

```text
api-mock-platform/
├── backend/
│   ├── controllers/       # Schema and dynamic mock request handlers
│   ├── services/          # OpenAI integration and local fallback generator
│   ├── utils/             # OpenAPI reference resolution
│   └── Dockerfile         # Render-ready production container
├── frontend/src/
│   ├── components/        # JSON viewer, method badges, notifications
│   └── pages/             # Upload, schema list, and schema detail views
├── docker-compose.yml     # Local PostgreSQL service
└── README.md
```

## License

MIT
