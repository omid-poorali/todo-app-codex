# Todo App Codex

A cross-platform to-do application built with React, TypeScript, Electron, Capacitor, and SQLite. The project showcases a lightweight ORM with migrations, versioning, and type-safety that runs across desktop (Windows, macOS) and mobile (Android, iOS).

## Features

- ⚛️ **React + TypeScript** front-end with hooks-based state management.
- 🖥️ **Electron** desktop shell with secure preload bridge.
- 📱 **Capacitor** integration for Android and iOS builds.
- 🗄️ **SQLite** persistence with a custom ORM that supports migrations, versioning, and type-safe records.
- ♻️ Shared business logic across all platforms through a unified ORM API.

## Getting Started

### Install dependencies

```bash
npm install
```

### Web preview

```bash
npm run dev
```

### Desktop (Electron)

Build the web assets, bundle the Electron entry points, and start the Electron shell:

```bash
npm run electron:dev
```

### Mobile (Capacitor)

Capacitor uses the Vite web build as its web assets. Build the web bundle and sync with the native project of your choice:

```bash
npm run build
npm run cap:sync
npm run cap:run:android # or npm run cap:run:ios
```

Follow the prompts in the native IDE (Android Studio / Xcode) to finish the platform-specific build.

## Project Structure

```
.
├── capacitor.config.ts         # Capacitor project configuration
├── electron/                   # Electron main & preload processes
├── scripts/                    # Build utilities
├── src/
│   ├── components/             # React UI components
│   ├── db/                     # ORM, migrations, schema, adapters
│   ├── electron/               # Renderer bridge helpers for Electron
│   ├── hooks/                  # React hooks
│   ├── styles/                 # Global styles
│   └── types/                  # Shared type declarations
└── vite.config.ts              # Vite configuration for the web bundle
```

## ORM Overview

The custom ORM implements:

- **Database adapters** for Capacitor (mobile) and Electron (desktop) with a unified interface.
- **Schema-first migrations** with automatic version tracking stored in a `__migrations` table.
- **Type-safe repositories** that map raw SQLite rows into domain objects.
- **Default seeding** to populate the database on first launch.

Extend the ORM by adding new table schemas, migrations, and repository helpers inside `src/db`.
