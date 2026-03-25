# McBook — Client

Frontend for the McBook McGill booking platform, built with React + Vite.

## Tech Stack

- **React 19** — UI framework
- **Vite** — build tool and dev server
- **React Router DOM** — client-side routing

## Getting Started

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | LandingPage | Search and entry point |
| `/dashboard` | Dashboard | Student appointment management |
| `/owner/dashboard` | OwnerDashboard | Professor/TA slot management |
| `/login` | LoginPage | Authentication |
| `/register` | RegisterPage | Account creation |

## Theming

Light and dark mode are supported via `data-theme` on the `<html>` element. Theme preference is persisted in `localStorage` under the key `mcbook-theme`. All colors use CSS variables defined in `index.css`.
