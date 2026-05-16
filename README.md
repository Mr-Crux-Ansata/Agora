
  # Civic-Tech Budgeting Platform

  This is a code bundle for Civic-Tech Budgeting Platform. The original project is available at https://www.figma.com/design/6KMX8VGqBm543Wed5Yb5MC/Civic-Tech-Budgeting-Platform.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

    ## Backend API (Node + SQL Server)

    Backend code lives in `backend/` and connects to SQL Server using the `pb` schema.

    1. Install backend dependencies:
      `npm run backend:install`
    2. Copy `backend/.env.example` to `backend/.env` and set your SQL Server credentials.
    3. Start backend in dev mode:
      `npm run backend:dev`

    Default URL: `http://localhost:4000`

    Available endpoints:
    - `GET /api/health`
    - `GET /api/cycles/:cycleId/current-phase`
    - `GET /api/proposals?cycleId=<guid>&lifecycle=<value>&participation=<value>&institutional=<value>`
    - `GET /api/proposals/:proposalId`
    - `POST /api/proposals/:proposalId/votes`
    - `POST /api/proposals/:proposalId/institutional-reviews`
    - `GET /api/results/:cycleId`
  