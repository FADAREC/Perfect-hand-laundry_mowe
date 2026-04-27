# Dry Cleaning Platform MVP

## 1. Technology Stack (Modern, Fast, and Production-Ready)

### Frontend
*   **React 18 + TypeScript**
*   **Vite**
*   **TailwindCSS**
*   **Shadcn UI**
*   **Wouter(client side routing)**
*   **React Query V5(For state management)**
*   **Framer-motion(micro animations)**

### Backend
*   **Node.js + Typescript + Express**
*   **Zod validation**
*   **Drizzle ORM** 
*   **PostgreSQL (Neon Serverless)**

### Deployment
*   **Full-stack deployed on Render** (Backend serves both API + static frontend).
*   **Live URL -** *https://caperberry-fabric-care.onrender.com*

### Architecture

* Full-stack TypeScript with shared schemas.
* Config-driven layout and business settings
* REST API with type-safe data models
* Real-time UI updates using server polling + smart caching
* Drizzle ORM migrations via drizzle-kit
---

## Setup Instructions

1. Clone Repo

```
git clone https://github.com/FADAREC/Dry-cleaning-system-.git
cd Dry-cleaning-system-
```
2. Install Dependencies

Backend

```
cd backend
npm install
```

Frontend

```
cd frontend
npm install
```

3. Environment Variables

Create .env in the backend folder:

```
DATABASE_URL=your_neon_database_url
PORT=8000
```

4. Run Database Migrations

```
npm run db:push
```

5. Start Project

Backend

```
npm run dev
```

---
### License

Personal project — no public license yet.

━━━━━━━━━━━━━━━━━━━━━━━
