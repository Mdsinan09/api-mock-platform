# API Mock Platform

AI-powered API testing and mocking platform. Upload any OpenAPI or Swagger specification and instantly get realistic mock endpoints.

## Stack

- **Backend:** Node.js, Express, Sequelize, PostgreSQL, OpenAI (optional)
- **Frontend:** React 18, Vite, Tailwind CSS, React Router
- **Database:** PostgreSQL 15 (Docker)
- **Mock engine:** Custom realistic data generator with smart schema inference

## Features

- 📤 Upload OpenAPI 3.0 and Swagger 2.0 specifications
- 📋 Browse and manage uploaded schemas
- 🔍 Automatically parse endpoints, methods, and response schemas
- 🎭 Dynamic mock server at `/mock/:schemaId/*`
- 🧠 Smart fallback that infers response models when specifications are incomplete
- 📋 Copy mock URLs to the clipboard
- 🖥️ View formatted mock JSON inline

## Quick start

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Start the backend
cd backend
cp .env.example .env
# Add your OPENAI_API_KEY to .env if you want optional AI features
npm install
npm run dev

# 3. Start the frontend in a new terminal
cd frontend
cp .env.example .env
npm install
npm run dev
```

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:5000>
- Mock API: `http://localhost:5000/mock/{schema-id}/{endpoint-path}`

## Environment variables

| Variable | Description |
| --- | --- |
| `PORT` | Backend port (default: `5000`) |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` | PostgreSQL credentials |
| `OPENAI_API_KEY` | OpenAI API key for optional GPT mock generation |
| `VITE_API_URL` | Frontend API base URL |

## Project structure

```text
api-mock-platform/
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Error handling
│   ├── models/         # Sequelize models
│   ├── routes/         # API routes
│   ├── services/       # Mock generator and OpenAI service
│   ├── utils/          # Reference resolver
│   └── server.js       # Entry point
├── frontend/
│   └── src/
│       ├── pages/      # Upload, list, and detail views
│       └── App.jsx
├── docker-compose.yml
└── README.md
```

## License

MIT
