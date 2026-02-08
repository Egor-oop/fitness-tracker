# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fitness tracking mobile app built with Expo (React Native) and Supabase (PostgreSQL backend). Targets iOS, Android, and Web from a single TypeScript codebase.

## Commands

```bash
npm start              # Start Expo dev server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
npm run web            # Run web version
npm run lint           # ESLint via expo lint
```

No test framework is configured yet.

### Supabase Local Development

Supabase config is in `supabase/config.toml`. Local services run on:
- API: port 54321
- Database (PostgreSQL 17): port 54322
- Studio: port 54323

## Architecture

- **Expo Router** with file-based routing — screens live in `app/`, files map to routes
- **Stack navigation** as the root navigator (configured in `app/_layout.tsx`)
- **Supabase** for auth (email/password) and database — no migrations or schema defined yet
- **React Native New Architecture** enabled
- **React Compiler** experiment enabled (`reactCompiler: true` in app.json)
- **Typed routes** enabled (`typedRoutes: true` in app.json)

## Directory Structure

```
app/                          # Screens & routing (Expo Router)
├── _layout.tsx               # Root layout (Stack navigator)
├── index.tsx                 # Landing / redirect screen
├── (auth)/                   # Auth group (login, register) — без табов
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
└── (tabs)/                   # Main app with bottom tab navigation
    ├── _layout.tsx           # Tab navigator config
    ├── index.tsx             # Home / dashboard
    ├── workouts/             # Workouts tab
    │   ├── _layout.tsx
    │   ├── index.tsx         # List of workouts
    │   ├── [id].tsx          # Workout detail
    │   └── new.tsx           # Create workout
    ├── progress.tsx          # Progress / statistics tab
    └── profile.tsx           # Profile / settings tab

components/                   # Reusable UI components
├── ui/                       # Primitive UI elements (Button, Input, Card, ...)
└── workout/                  # Domain-specific components (WorkoutCard, ExerciseRow, ...)

lib/                          # Core logic, no React dependencies
├── supabase.ts               # Supabase client init
├── api/                      # Backend queries grouped by domain
│   ├── workouts.ts           # CRUD for workouts
│   ├── exercises.ts          # CRUD for exercises
│   ├── progress.ts           # Stats / aggregations
│   └── auth.ts               # Sign-in, sign-up, sign-out helpers
└── types.ts                  # Shared TypeScript types & Supabase DB types

hooks/                        # Custom React hooks
├── use-auth.ts               # Auth state & session
└── use-workouts.ts           # Data fetching / mutations for workouts

constants/                    # App-wide constants (colors, spacing, config)

supabase/                     # Supabase project config & DB migrations
├── config.toml
├── seed.sql
└── migrations/
```

### Conventions

- **Imports** — use path alias `@/*` from project root: `import { supabase } from '@/lib/supabase'`
- **`lib/api/`** — pure async functions that call Supabase, return typed data. No React, no hooks. Одна функция — один запрос
- **`hooks/`** — React hooks that wrap `lib/api/` functions with state/loading/error
- **`components/ui/`** — generic, reusable, не знают о бизнес-логике
- **`components/<domain>/`** — domain-specific составные компоненты (используют `ui/` внутри)
- **Route groups** `(auth)`, `(tabs)` — используют скобки для layout grouping без влияния на URL

## TypeScript

- Strict mode enabled
- Path alias: `@/*` maps to project root (e.g., `@/components/Foo`)
- Extends `expo/tsconfig.base`

## Linting

- ESLint 9 flat config extending `eslint-config-expo`
- VS Code auto-fixes, organizes imports, and sorts members on save
