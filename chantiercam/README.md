# ChantierCam

A construction-site management platform: **Site Manager**, **Worker**, and **Client** roles, each with their own dashboard, working inside projects created by the site manager.

Frontend-only React app (JavaScript, Vite). All data is stored in the browser's `localStorage` — there is no backend/API. This makes it a fully working, click-through prototype: project creation, user accounts with generated credentials, task workflow, materials & payments with a live budget, progress photo/video updates, in-app messaging and notifications.

## 1. Install & run

Requires [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

To build for production / static hosting:

```bash
npm run build
npm run preview
```

## 2. Try it immediately — demo accounts

The app seeds a demo project ("Résidence Les Palmiers") on first load so you can explore every role right away, from the landing/login page:

| Role | Email | Password |
|---|---|---|
| Site Manager | `manager@chantiercam.com` | `Manager123` |
| Worker | `jean.fotso@chantiercam.com` | `Worker123` |
| Client | `sophie.ndjock@chantiercam.com` | `Client123` |

You can wipe this and start fresh from **Settings → System → Reset All Data** (site manager account), or by clearing your browser's localStorage for this site.

## 3. How the app is organized

**Everything happens inside a project.** The site manager creates a project, then creates worker and client accounts *for that project* — each gets a generated email/password shown once in a "Login Credentials" box so the manager can hand it to them. Workers and clients log in directly into the project they were created for. A site manager with several projects can switch between them from the sidebar; every action (tasks, materials, payments, progress, messages) is scoped to the currently selected project.

### Site Manager
- **Projects** — create/edit projects (name, location, description, budget, dates, status), switch between projects.
- **Users** — create worker & client accounts with personal info (phone, address, ID number, emergency contact); credentials are generated and shown to copy/share.
- **Tasks** — create and assign tasks to workers, track status (pending → accepted/refused → in progress → submitted → completed), validate or request changes on submitted work.
- **Materials** — record purchases with quantity, unit price, auto-computed total, and supplier (fournisseur) details; suggested-material quick-fill chips.
- **Payments** — record payments to workers/clients with date, mode (cash, bank transfer, mobile money, check) and type (advance, partial, full).
- **Finances** — budget vs. spend overview and a transaction ledger built automatically from materials purchases and payments.
- **Progress** — post updates with photos/videos by work phase; visible to the client.
- **Messages** — chat with any worker or client on the project.
- **Settings** — edit profile, change language/theme, suspend/reactivate/delete user accounts, reset demo data.

### Worker
- **Tasks** — accept or refuse assigned tasks, start work, submit completed work with a note and photo/video proof (camera-capture enabled on mobile).
- **My Payments** — view payments received (amount, date, mode, type).
- **Messages** — chat with the site manager.
- **Settings** — profile, language, theme.

### Client
- **Progress** — view project photo/video updates by phase.
- **Messages** — chat with the site manager.
- **Settings** — profile, language, theme.

### Shared
- **Notifications** — a bell icon on every page; task assignments, validations, new messages, payments and progress updates all push a notification to the relevant user(s).
- **Language** — English / Français, switchable from the landing page or Settings.
- **Theme** — White or Blue, switchable from the landing page or Settings.

## 4. Project structure

```
src/
  context/       Auth, Data (localStorage store), Language, Theme, Toast
  components/    Shared UI: layout shells, modal, chat, progress feed, icons…
  pages/
    Landing.jsx        Landing + role-based login/signup
    manager/            Site manager pages
    worker/              Worker pages
    client/              Client pages
  utils/         Helpers, demo seed data, suggested materials list
  i18n/          EN/FR translation dictionary
  styles/        Single global stylesheet (CSS variables per theme)
```

## 5. Notes

- This is a frontend prototype: data lives in `localStorage` on the device/browser used, and uploaded photos/videos are embedded as data URLs (fine for demos; a real deployment should upload media to real storage and add a backend/API for persistence, auth, and multi-device sync).
- The logo used throughout the app (`public/logo.png`) was extracted from the provided design.
