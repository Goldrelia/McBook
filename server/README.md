# McBook Server

Backend API for the McBook COMP 307 booking platform, built with Node.js, Express, and MySQL.

## Tech Stack

- Node.js (CommonJS)
- Express
- MySQL (`mysql2`)
- JWT authentication

## Prerequisites

- Node.js 18+ (or current LTS)
- npm
- MySQL 8+

## Current Structure

```text
server/
├── sql/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   └── app.js
├── .env.example
├── package.json
└── README.md
```

## Environment Setup

Create `server/.env` with:

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=cs307-user
DB_PASSWORD=
DB_NAME=comp-307-db
JWT_SECRET=your_jwt_secret
PORT=3000
```

## Database Setup

From the project root:

```bash
mysql -u cs307-user -p < server/sql/schema.sql
```

Then enter the password provided by IT.

## Run Locally

From `server/`:

```bash
npm install
npm run dev
```

or production mode:

```bash
npm start
```

Server listens on `http://localhost:3000` by default.

## Deploy on Mimi Server

Target URL:

- [https://winter2026-comp307-group03.cs.mcgill.ca/](https://winter2026-comp307-group03.cs.mcgill.ca/)

Deployment behavior already supported by this backend:

- The app listens on port `3000`.
- API routes are mounted at `/api`.
- Static frontend files are served from the first valid location:
  - `STATIC_DIR` env var (if set), or
  - `/home/cs307-user/app`, or
  - local fallback `client/dist`.

Recommended steps:

1. clone on server
2. Build frontend in `client/` (`npm run build`).
3. Set `server/.env` values for Mimi MySQL credentials.
4. Start backend in `server/` with `npm start`.

## Useful Scripts

- `npm run dev` - run with nodemon
- `npm start` - run with Node
