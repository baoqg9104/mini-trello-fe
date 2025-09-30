# Mini Trello App (Frontend)

<p align="center">
  <img src="public/trello-icon.png" alt="Mini Trello" width="96" height="96" />
</p>

A lightweight Trello-like board application built with React, TypeScript, and Vite. It supports boards, columns, cards, tasks, member invites, and drag-and-drop for cards and tasks. This is the frontend; it consumes a REST API backend.

Backend: https://github.com/baoqg9104/mini-trello-general-api

## Tech Stack ⚙️
- React 19 + TypeScript
- Vite 7
- Material UI (MUI) for UI components
- Axios for HTTP requests
- React Router for routing
- @hello-pangea/dnd for drag-and-drop
- React Toastify for notifications

## Project Structure 🗂️

Top-level files:
- `index.html` – App entry HTML
- `vite.config.ts` – Vite config
- `eslint.config.js` – ESLint config
- `tsconfig*.json` – TypeScript configs
- `public/` – Static assets

Source folder (`src/`):
- `main.tsx` – Bootstraps React app
- `App.tsx` – App shell/layout
- `index.css` – Global styles
- `assets/` – Images/icons bundled by Vite
- `components/` – Reusable UI components
  - `BoardColumnList.tsx` – Renders cards within a column; outer droppable for card DnD
  - `BoardCardWithTasks.tsx` – Renders a card with its tasks; inner droppable for task DnD and CRUD/assign features
  - `EditBoardDialog.tsx` – Edit board name/description dialog
- `contexts/` – React Contexts (if any)
- `pages/` – Route pages
  - `Home.tsx` – Boards listing, create board
  - `BoardDetailPage.tsx` – Board detail, columns, cards + DnD, invite, card dialogs
  - `InviteConfirmPage.tsx` – Auto-process invite accept/decline via email link
  - `NotFound.tsx` – 404 page
- `routes/` – Routing setup
  - `AppRoutes.tsx` – All routes and auth guards
- `types/` – Shared TS types (`board.ts`, `card.ts`, `task.ts`, etc.)
- `utils/` – Utilities
  - `axiosInstance.ts` – Axios base URL and interceptors (JWT handling)

## Key Features ✨
- 📋 Boards: create, edit, view
- 🧱 Columns: To do, Doing, Done
- 🗂️ Cards: create, edit, delete, drag between columns (status updates)
- ✅ Tasks: list, create, delete, assign/unassign, drag across cards (move and update status/parent)
- ✉️ Invite members: send email invite; accept/decline handled via a special confirmation page
- ⏱️ Near real-time updates via polling (optional backend upgrade to SSE/WebSockets)

## Environment variables 🔧

The frontend expects a REST backend. Configure the base URL via `src/utils/axiosInstance.ts`. If you prefer environment variables, adapt `axiosInstance.ts` to read from `import.meta.env` and define a `.env` file (e.g., `VITE_API_BASE_URL`). Example:

```
VITE_API_BASE_URL=http://localhost:3000
```

Then in `axiosInstance.ts`:

```ts
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
```

Currently it’s set directly to `http://localhost:3000`.

## Prerequisites 📦
- Node.js 18+ (recommended)
- A running backend (Express/Firestore) listening on the configured base URL
- For auth-protected routes: a JWT stored in `localStorage` (handled by your sign-in flow)

## Run (development) ▶️

In the project root:

```powershell
npm install
npm run dev
```

- This starts Vite dev server (default: http://localhost:5173).
- Ensure the backend server is running and accessible from the browser.

## Build for production 🏗️

```powershell
npm run build
npm run preview
```

- `npm run build` outputs to `dist/`.
- `npm run preview` serves the production build locally.

## Linting 🧹

```powershell
npm run lint
```

## Drag and Drop notes 🧲
- Card-level DnD: Columns are droppable with type `CARD`. Cards are draggable.
- Task-level DnD: Each card has an inner droppable (`type="TASK"`). Tasks are draggable across cards.
- After DnD, the app updates the relevant API endpoints (card status, task status and parent card) and triggers a refresh.

## Troubleshooting 🛠️
- If you see 401/403 errors, confirm the JWT in `localStorage` is valid and not expired.
- If tasks don’t appear after a move, verify the backend supports updating a task’s `cardId` and `status` via PUT.
- For CORS issues, configure your backend to allow the Vite dev origin (e.g., http://localhost:5173).

## License 📄
This project is for demonstration and learning purposes.
