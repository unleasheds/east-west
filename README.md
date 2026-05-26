# EastWest Halal Travel — Full-Stack App

Airbnb-style rebranded travel platform for halal-friendly holidays.

## Stack

| Layer    | Tech                                   |
|----------|----------------------------------------|
| Frontend | React 18 · Vite · Tailwind CSS · Zustand · React Router |
| Backend  | NestJS · TypeORM · PostgreSQL          |
| Comms    | WhatsApp deep-link integration         |

## Design

Airbnb-inspired UI with EastWest brand colours:
- **Coral** `#E07B54` — primary CTA
- **Halal green** `#22C55E` — trust badges
- **Sand** `#F7F5F2` — page background
- **Inter** — typography

## Project structure

```
east-west/
├── client/   # React + Vite + Tailwind
└── server/   # NestJS + TypeORM + PostgreSQL
```

## Quick start

### 1. Database
```bash
# create a local PostgreSQL database
createdb eastwest_db
```

### 2. Server
```bash
cd server
cp .env.example .env    # fill in DB credentials
npm install
npm run start:dev       # runs on :3001
```

### 3. Client
```bash
cd client
npm install
npm run dev             # runs on :5173
```

## API routes

| Method | Path                  | Description             |
|--------|-----------------------|-------------------------|
| GET    | /api/packages         | List all packages       |
| GET    | /api/packages/:id     | Get package detail      |
| POST   | /api/trips            | Submit trip request     |
| GET    | /api/trips            | List trip requests      |
| POST   | /api/users            | Create/update profile   |
| POST   | /api/wishlist         | Save package            |
| DELETE | /api/wishlist/:id     | Remove from wishlist    |
| GET    | /api/wishlist/:userId | Get user wishlist       |
| POST   | /api/seed             | Seed package data       |
