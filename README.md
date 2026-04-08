# Stepsnaps

A full-stack monorepo with a web app (TanStack Start) and mobile app (Expo/React Native), powered by tRPC, Drizzle ORM, and Better Auth.

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Web**: TanStack Start (Vite, React 19, Tailwind CSS v4)
- **Mobile**: Expo + React Native + NativeWind
- **API**: tRPC v11 (typesafe end-to-end)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Better Auth (Google & Apple OAuth)
- **UI**: shadcn/ui + Radix UI

## Project Structure

```
stepsnaps/
├── apps/
│   ├── tanstack-start/     # Web app (port 3001)
│   └── expo/               # Mobile app (iOS & Android)
├── packages/
│   ├── api/                # tRPC router definitions
│   ├── auth/               # Better Auth config
│   ├── db/                 # Drizzle schema & client
│   ├── ui/                 # Shared shadcn/ui components
│   └── validators/         # Shared Zod schemas
└── tooling/
    ├── eslint/             # Shared ESLint config
    ├── prettier/           # Shared Prettier config
    ├── tailwind/           # Shared Tailwind config
    └── typescript/         # Shared tsconfig
```

## Prerequisites

- **Node.js 22** (see `.nvmrc` — use `nvm use` to switch)
- **pnpm 10** (run `corepack enable` to activate the version from `package.json`)
- **PostgreSQL** running locally or a remote connection string

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

> The `.env` file stays at the project root — all apps read from there.

Edit `.env` and fill in:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `AUTH_SECRET` | Random secret — generate with `openssl rand -base64 32` | Yes |
| `AUTH_GOOGLE_ID` | Google OAuth client ID | No (for local dev) |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret | No (for local dev) |
| `AUTH_APPLE_ID` | Apple OAuth client ID | No (for local dev) |
| `AUTH_APPLE_SECRET` | Apple OAuth client secret | No (for local dev) |

### 3. Set up the database

```bash
# Create the database (if it doesn't exist yet)
createdb stepsnaps

# Push the Drizzle schema to your database
pnpm db:push
```

### 4. Start development

```bash
# Run everything (web + mobile)
pnpm dev
```

> If you only need the web app, run `cd apps/tanstack-start && pnpm dev` directly — no simulator needed.

Or run apps individually:

```bash
# Web only
cd apps/tanstack-start && pnpm dev    # http://localhost:3001

# Mobile (iOS) — requires Xcode + Simulator
cd apps/expo && pnpm dev:ios

# Mobile (Android) — requires Android Studio
cd apps/expo && pnpm dev:android
```

> **Note:** If you just installed Xcode or updated it, open the iOS Simulator manually once before running `pnpm dev:ios`.

## Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all packages and apps |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm format:fix` | Format code with Prettier |
| `pnpm db:push` | Push Drizzle schema to database |
| `pnpm db:generate` | Generate Drizzle migration files |
| `pnpm db:studio` | Open Drizzle Studio (database GUI) |
| `pnpm auth:generate` | Regenerate Better Auth schema |
| `pnpm ui-add` | Add a new shadcn/ui component |
| `pnpm clean` | Remove all `node_modules` |

## Adding New Packages

To scaffold a new package in the monorepo:

```bash
pnpm turbo gen init
```

This sets up `package.json`, `tsconfig.json`, and tooling configuration automatically.

## Architecture Notes

- **`@stepsnaps/api`** is a prod dependency in the web app but a **dev dependency** in Expo (types only — no server code ships to mobile). If you need shared runtime code, use `@stepsnaps/validators`.
- **Auth schema** (`packages/db/src/auth-schema.ts`) is auto-generated and committed to the repo. Don't edit it manually — if you change the auth config in `packages/auth/script/auth-cli.ts`, regenerate it with `pnpm auth:generate`.
- **Expo OAuth** requires the web app to be running (or deployed) as a proxy for OAuth callbacks. See the [Better Auth proxy plugin docs](https://www.better-auth.com/docs/plugins/oauth-proxy).

## Deployment

### Web (TanStack Start)

Build and deploy to your hosting provider. Set the required environment variables (`DATABASE_URL`, `AUTH_SECRET`, etc.).

```bash
pnpm build
# Output: apps/tanstack-start/.output
```

A `Dockerfile` is included for container-based deployments.

### Mobile (Expo)

Follow the [Expo distribution guide](https://docs.expo.dev/distribution/introduction) for submitting to app stores. Key steps:

```bash
pnpm add -g eas-cli
eas login
cd apps/expo
eas build:configure
eas build --platform ios --profile production
eas submit --platform ios --latest
```

Use [EAS Update](https://docs.expo.dev/eas-update/getting-started) for OTA bug fixes without a full app store submission.
