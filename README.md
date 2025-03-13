# ZPI 2024

## Project description

ZPI2024 project is a fullstack application with a monorepo architecture, built using Turborepo. The system consists of a frontend (web), backend (API) and reverse proxy for handling custom domains and HTTPS.

## Used technologies

### Frontend (web)

- React 19
- React Router 7
- Tailwind CSS
- Radix UI (accessibility components)
- React Hook Form + Zod (form validation)
- Tanstack React Query (state management)
- Axios (HTTP requests)
- DND Kit (drag and drop)
- Zustand (state management)

### Backend (API)

- NestJS
- Drizzle ORM
- PostgreSQL
- JWT Authentication
- Swagger (API documentation)
- TypeBox (validation)
- Jest (tests)

### Infrastructure

- Turborepo (monorepo management)
- pnpm (package management)
- Docker + Docker Compose (containers)
- Caddy (reverse proxy)
- Mailhog (email testing)

## System requirements

- Node.js >= 18
- pnpm 9.0.0+
- Docker and Docker Compose
- Caddy (for reverse proxy)

## Installation and execution

### 1. Cloning the repository

```bash
git clone [repository-address]
cd zpi2024
```

### 2. Installing dependencies

```bash
pnpm install
```

### 3. Running infrastructure (PostgreSQL and Mailhog)

```bash
docker-compose up -d
```

### 4. Database configuration

```bash
pnpm db:generate  # Generating migrations
pnpm db:migrate   # Running migrations
pnpm db:seed      # Optional: populating the database with sample data
```

### 5. Generating API client (for frontend)

```bash
pnpm generate:client
```

### 6. Running development environment

```bash
pnpm dev
```

After completing the above steps:

- Frontend will be available at: http://localhost:3000
- API will be available at: http://localhost:3001
- API documentation (Swagger): http://localhost:3001/api
- Mailhog (email testing interface): http://localhost:8026

## Project structure

The project uses a monorepo architecture with the following structure:

- `/apps` - Main applications
  - `/web` - Frontend application
  - `/api` - Backend API
  - `/reverse-proxy` - Caddy configuration for reverse proxy
- `/packages` - Shared packages
  - TypeScript, ESLint configurations
  - Shared UI components
  - Email templates

## Useful commands

- `pnpm build` - Build all applications
- `pnpm dev` - Run development environment
- `pnpm lint` - Check code for errors
- `pnpm format` - Format code
