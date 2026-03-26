# McBook — Client

Frontend for the McBook McGill booking platform, built with React + Vite.

## Tech Stack

- **React 19** — UI framework
- **Vite** — build tool and dev server
- **React Router DOM** — client-side routing

## Project Structure

```
src/
├── components/       # Shared reusable components
│   ├── Navbar.jsx
│   ├── Btn.jsx
│   ├── Card.jsx
│   ├── Avatar.jsx
│   ├── TimeDropdown.jsx
│   └── theme.css
├── pages/            # Page-level components
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── Dashboard.jsx
│   ├── OwnerDashboard.jsx
│   ├── BrowseSlotsPage.jsx
│   └── VotePage.jsx
├── context/          # React context providers
├── services/         # API call functions
├── utils/            # Helper utilities
├── index.css         # Global styles and CSS variables
├── main.jsx          # App entry point
└── App.jsx           # Route definitions
```

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
| `/login` | LoginPage | Authentication — McGill email only, auto-creates account on first login |
| `/dashboard` | Dashboard | Student appointment management |
| `/owner/dashboard` | OwnerDashboard | Professor/TA slot management |
| `/slots` | BrowseSlotsPage | Browse and reserve office hours, send meeting requests |
| `/vote/:token` | VotePage | Group meeting availability voting via invite link |

## Booking Types

| Type | Name | Description |
|---|---|---|
| Type 1 | Meeting Request | Student sends a request to a professor/TA who accepts or declines |
| Type 2 | Group Meeting | Owner defines available slots, shares invite link, users vote, owner finalizes |
| Type 3 | Recurring Office Hours | Owner defines weekly slots for N weeks, students reserve directly |

## Authentication

Only McGill email addresses are accepted:
- `@mcgill.ca` — Professors and TAs, redirected to Owner Dashboard
- `@mail.mcgill.ca` — Students, redirected to Student Dashboard

No separate registration — first login automatically creates an account.

## Theming

Light and dark mode are supported via `data-theme` on the `<html>` element. Theme preference is persisted in `localStorage` under the key `mcbook-theme`. All colors use CSS variables defined in `index.css`.
