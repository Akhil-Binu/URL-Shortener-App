# SwiftLink 🔗

SwiftLink is a premium, self-hosted, full-stack URL shortener application. It is built using **TypeScript**, **React** (via Vite) for the frontend, **Node.js** with **Express** for the backend, and **SQLite** for database persistence.

The application features a sleek dark-themed interface, designed with modern glassmorphism aesthetics, responsive styling, and micro-animations.

---

## Features

- **Link Shortening:** Instantly convert long, messy URLs into short, clean codes (e.g., `P82vzZ`).
- **Interactive Dashboard:** Paste your links and view the shortened results in a beautiful success card.
- **Click Tracking & Analytics:** Real-time click counters for each shortened URL.
- **Link History:** A scrollable list of previously created links, sorted with the newest links first.
- **Instant Copying:** Integrated copy buttons with interactive checkmark feedback to quickly save short links to your clipboard.
- **SQLite Database:** Data persists locally, ensuring your shortened links and analytics are saved across server restarts.
- **Sleek Aesthetics:** Glassmorphic cards, glowing focus fields, neon highlights, and custom loading states.

---

## Tech Stack

### Frontend
- **Framework:** React + TypeScript (scaffolded via Vite)
- **Styling:** Custom Vanilla CSS (no external bloated styling frameworks)
- **Icons:** Custom high-performance inline SVGs (zero dependency)

### Backend
- **Framework:** Node.js + Express + TypeScript
- **Database:** SQLite (using standard `sqlite3` driver with the promise-based `sqlite` wrapper)
- **Development Tooling:** `ts-node-dev` (for fast hot-reloading)

---

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### Installation
You can install dependencies for the root orchestrator, backend, and frontend with a single command from the project root:

```bash
npm run install:all
```

This is equivalent to running:
1. `npm install` in the root folder.
2. `npm install` in the `backend` folder.
3. `npm install` in the `frontend` folder.

---

## Running the Application

### Development Mode
To start both the backend server and the frontend dev server concurrently, run the following command in the project root:

```bash
npm run dev
```

- **Frontend Dashboard:** Available at [http://localhost:5173](http://localhost:5173)
- **Backend API Server:** Running on [http://localhost:5000](http://localhost:5000)

When you input a URL and shorten it, it will be saved in the SQLite database (`backend/database.sqlite`). Any clicks on a short link (e.g. `http://localhost:5000/P82vzZ`) will automatically record the click analytic and redirect the browser to the original destination.

---

## Production Build

To compile and bundle both the backend and frontend for production, run:

```bash
npm run build
```

This generates:
- Compiled JavaScript files in `backend/dist`
- Optimized static frontend assets in `frontend/dist`

---

## Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── db.ts          # SQLite connection and schema setup
│   │   ├── index.ts       # Express server, routing, and redirects
│   │   └── utils.ts       # URL validation, normalization, and shortcode generation
│   ├── database.sqlite    # SQLite local database (generated on start)
│   ├── package.json       # Backend dependencies and scripts
│   └── tsconfig.json      # TypeScript compiler settings for backend
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx        # React frontend logic & dashboard UI
│   │   ├── App.css        # Reset stylesheet
│   │   ├── index.css      # Custom styling, dark glassmorphism, animations
│   │   └── main.tsx       # Vite React application entry
│   ├── index.html         # Frontend HTML template & SEO titles
│   ├── package.json       # Frontend dependencies and scripts
│   └── tsconfig.json      # TypeScript compiler settings for frontend
│
├── package.json           # Root workspace package runner (scripts for concurrently running)
└── README.md              # Installation and run guide (this file)
```
