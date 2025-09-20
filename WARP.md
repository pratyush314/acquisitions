# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project: acquisitions (Node.js, ESM, Express, Drizzle ORM)

Commands

- Install dependencies
  - Windows PowerShell
    ```powershell path=null start=null
    npm install
    ```
  - CI or clean install (respects package-lock.json)
    ```powershell path=null start=null
    npm ci
    ```

- Run the API in watch mode (development)
  ```powershell path=null start=null
  # Ensure required environment variables are set in your shell or a .env file
  npm run dev
  ```

- Start without watch (no npm script provided)
  ```powershell path=null start=null
  node src/index.js
  ```

- Lint
  ```powershell path=null start=null
  npm run lint
  ```

- Lint and fix
  ```powershell path=null start=null
  npm run lint:fix
  ```

- Format (Prettier)
  ```powershell path=null start=null
  npm run format
  ```

- Check formatting only
  ```powershell path=null start=null
  npm run format:check
  ```

- Database (Drizzle Kit)
  - Generate migrations from current schema
    ```powershell path=null start=null
    # Requires $env:DATABASE_URL to be set (Postgres connection string)
    npm run db:generate
    ```
  - Apply migrations
    ```powershell path=null start=null
    # Requires $env:DATABASE_URL to be set
    npm run db:migrate
    ```
  - Open Drizzle Studio
    ```powershell path=null start=null
    npm run db:studio
    ```

- Environment variables (Windows PowerShell examples)
  ```powershell path=null start=null
  $env:PORT = "3000"
  $env:DATABASE_URL = "postgres://user:password@host:5432/db"
  $env:JWT_SECRET = "a-strong-secret"
  $env:NODE_ENV = "development"
  ```

- Tests
  - No test runner or npm test script is currently configured. The ESLint config includes globals for tests/**/*.js, but there are no tests in the repo.

High-level architecture and structure

- Runtime and entry
  - src/index.js loads environment variables via dotenv and starts the HTTP server (src/server.js).
  - src/server.js imports the Express app and listens on PORT (default 3000).

- HTTP application (Express)
  - src/app.js wires core middleware: helmet, cors, JSON/body parsing, cookie-parser, and HTTP request logging via morgan piped into the Winston logger.
  - Health and root endpoints:
    - GET / returns a simple greeting and exercises the logger.
    - GET /health returns status/uptime JSON.
    - GET /api returns a simple service banner.
  - Feature routes are mounted under /api. Currently, /api/auth is implemented via src/routes/auth.routes.js.

- Module resolution and ESM
  - The project uses native ESM ("type": "module").
  - package.json defines import aliases under "imports" (e.g., "#config/*", "#services/*"). These are used across the codebase to avoid long relative paths (e.g., import logger from '#config/logger.js').

- Auth feature flow (implemented path: POST /api/auth/sign-up)
  - src/routes/auth.routes.js maps the HTTP route to the controller.
  - src/controllers/auth.controller.js orchestrates the request:
    - Validates input with Zod (src/validations/auth.validation.js).
    - Delegates user creation to the service.
    - Issues a JWT and sets it as a secure HTTP-only cookie.
    - Returns a minimal user payload in the response.
  - src/services/auth.service.js implements user creation:
    - Hashes the password with bcrypt.
    - Uses Drizzle ORM to check for existing users and insert the new one.
  - src/models/user.model.js defines the users table schema for Drizzle (Postgres dialect).
  - src/utils/jwt.js wraps jsonwebtoken with a shared secret and default 1d expiry.
  - src/utils/cookies.js centralizes cookie options (e.g., httpOnly, sameSite, secure in production).
  - src/utils/format.js formats Zod validation errors for responses.

- Persistence layer
  - src/config/database.js initializes Drizzle ORM using @neondatabase/serverless (HTTP driver) and exports db and sql. Requires DATABASE_URL.
  - drizzle/ contains generated migration SQL and metadata. The initial migration creates the users table with a unique email constraint.

- Logging
  - src/config/logger.js configures Winston with JSON logs and timestamps. In non-production, it also logs to the console with colors. File transports write to logs/error.log and logs/combined.log.
  - HTTP access logs are handled by morgan and forwarded into Winston via a stream.

- Environment
  - Required/used variables: DATABASE_URL (Postgres), JWT_SECRET (JWT signing), PORT (server port, defaults to 3000), NODE_ENV (controls logger console output and cookie security).
  - dotenv is loaded at process start, so a .env file at the repo root is respected if present.

- Notable routes and current status
  - POST /api/auth/sign-up is fully implemented as described above.
  - POST /api/auth/sign-in and POST /api/auth/sign-out are placeholders.

Additional notes for future agents

- The code follows a conventional layering: routes → controllers → services → models and utils, with validation at the controller boundary and logging across layers. This separation should be maintained when adding new features.
- Because the project uses ESM and the package.json "imports" field, prefer the existing #aliases rather than relative paths when creating new modules under src/.
- Drizzle Kit commands are available via npm scripts; ensure DATABASE_URL is set before running them. Migrations are committed under drizzle/.
