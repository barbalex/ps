# Developer Documentation: SQL Source Of Truth And Sync

## Why This Exists

This project uses SQL files in multiple locations:

- `backend/db/init/`
- `backend-dev/db/init/`
- `src/sql/`

To avoid manual drift, `backend/db/init/` is the single source of truth.

## Source Of Truth

Edit SQL files only in:

- `backend/db/init/`

Do not manually edit mirrored copies in `backend-dev/db/init/` or `src/sql/`.

## Sync Commands

### Sync files

```bash
npm run sync-sql
```

This does:

1. Mirrors all files from `backend/db/init/` to `backend-dev/db/init/`.
2. Copies selected files into `src/sql/`:
   - `01_immutableDate.sql` -> `immutableDate.sql`
   - `02_uuidv7.sql` -> `uuidv7.sql`
   - `04_createTables.sql` -> `createTables.sql`
   - `07_triggers.sql` -> `triggers.sql`

### Check for drift

```bash
npm run sync-sql:check
```

- Exit code `0`: everything is in sync.
- Exit code `1`: one or more mirrored files are out of sync.

## Pre-Commit Hook

A git pre-commit hook is configured to run:

```bash
npm run sync-sql:check
```

If files are out of sync, the commit is blocked.

### One-time setup after clone

```bash
npm install
npm run hooks:install
```

`hooks:install` sets:

- `git config core.hooksPath .githooks`

## Typical Workflow

1. Edit SQL in `backend/db/init/`.
2. Run `npm run sync-sql`.
3. Commit changes.

If commit fails on SQL sync check:

1. Run `npm run sync-sql`.
2. Re-stage updated files.
3. Commit again.

## Files Involved

- Sync script: `scripts/sync-sql.mjs`
- Hook installer: `scripts/install-git-hooks.mjs`
- Hook file: `.githooks/pre-commit`
- NPM scripts: `package.json`
