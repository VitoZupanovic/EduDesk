# EduDesk Frontend

React frontend for the PAAD Infoeduka / EduDesk project.

## Requirements

- Node.js 24 LTS, or at least Node.js 20.19+
- npm
- Git

## Clone the repository

```bash
git clone https://github.com/lordicode/Elmer_PAAD_Infoeduka_Frontend.git
```

## Install dependencies

```bash
npm install
```

Every teammate must run `npm install` after cloning.

## Run development server

```bash
npm run dev
```

## Build project

```bash
npm run build
```

## Preview production build

```bash
npm run preview
```

## Notes for the team

- `node_modules/` and `dist/` are intentionally not committed.
- Environment files such as `.env` are ignored and should not be committed.

## Backend API URL

1. Copy `.env.example` to `.env`.
2. The default backend URL is `http://localhost:5289`.
3. Change the port only if your backend runs on a different port.
4. The `.env` file is ignored and should not be committed.
5. Vite environment variable names must start with `VITE_`.

## Main dependencies

- React
- Vite
- React Router DOM
- Bootstrap

## Project Structure

- `src/components`: Reusable UI building blocks such as navbar, footer, cards, and modal placeholders.
- `src/pages`: Top-level route pages (home, login, register, courses, notifications, users).
- `src/services`: Placeholder API/service layer for future backend calls.
- `src/context`: Shared app state providers and hooks (authentication placeholder).
- `src/routes`: Central routing configuration for page navigation.
- `src/styles`: Global stylesheet for base app styling.
