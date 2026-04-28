# McBook

McBook is a COMP 307 booking platform for McGill that supports:

- Type 1: one-on-one meeting requests
- Type 2: group meeting polls and finalization
- Type 3: recurring office hours

## Repository Layout

```text
McBook/
├── client/   # React + Vite frontend
├── server/   # Node + Express + MySQL backend
└── README.md
```

Detailed docs:

- `client/README.md`
- `server/README.md`

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm
- MySQL 8+

## Quick Start (Local)

1. Clone the repo and install dependencies:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```
2. Create `server/.env` (see `server/README.md` for full example).
3. Initialize database:
   ```bash
   cd ..
   mysql -u root < server/sql/schema.sql
   ```
4. Start backend:
   ```bash
   cd server
   npm run dev
   ```
5. Start frontend (new terminal):
   ```bash
   cd client
   npm run dev
   ```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Deploy on Mimi

Target domain:

- [https://winter2026-comp307-group03.cs.mcgill.ca/](https://winter2026-comp307-group03.cs.mcgill.ca/)

High-level steps:

1. Clone repo on server at `/home/cs307-user/app`.
2. Build frontend in `client/`:
   ```bash
   npm run build
   ```
3. Configure `server/.env` with Mimi DB credentials.
4. Start backend in `server/` with:
   ```bash
   npm start
   ```

Notes:

- Backend listens on port `3000`.
- API routes are served under `/api`.
- Frontend uses relative `/api` calls by default, so it works both locally and on Mimi.
