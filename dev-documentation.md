**Developer Documentation**

This file serves the developer(s) and AI. It's goal is to ensure

# Styling

## Current situation

Primarily css modules are used.
Dynamic styling is usually implemented via inline styles.

For some general styles a global .css file is used.

## Good alternative?

Use css directly, without modules, as mentioned here: https://medium.com/@rapPayne/stop-writing-react-local-styles-use-the-component-classname-pattern-9a820c6447de

1. create a .css file with the same name as the (single) component file
2. give the base class the same name as the component (important: prevent name conflicts?)
3. give the base div of the component the base class
4. use css nesting to style all the component's elements in the component's .css file
5. add dynamic styling by dynamically changing classes (there may be cases where inline does not work?)

# SQL Source Of Truth And Sync

## Why This Exists

This project uses SQL files in multiple locations:

- `backend/db/init/`
- `backend-dev/db/init/`
- `src/sql/`
- `backend/db/` and `backend-dev/db/` for shared generator/test SQL assets

To avoid manual drift, `backend/db/init/` is the single source of truth.

## Source Of Truth

Edit SQL files only in:

- `backend/db/init/`
- `backend/db/` for these shared files:
  - `generate_qcs_sql.mjs`
  - `test_history_tables.sql`
  - `test_history_tables_smoke.sql`
  - `test_history_tables_full_coverage.sql`

Do not manually edit mirrored copies in `backend-dev/db/init/` or `src/sql/`.
Do not manually edit mirrored copies in `backend-dev/db/` for the shared files listed above.

## Sync Commands

### Sync files

```bash
npm run sync-sql
```

This does:

1. Mirrors all files from `backend/db/init/` to `backend-dev/db/init/`.
2. Mirrors selected shared files from `backend/db/` to `backend-dev/db/`:
   - `generate_qcs_sql.mjs`
   - `test_history_tables.sql`
   - `test_history_tables_smoke.sql`
   - `test_history_tables_full_coverage.sql`
3. Copies selected files into `src/sql/`:
   - `01_immutableDate.sql` -> `immutableDate.sql`
   - `02_uuidv7.sql` -> `uuidv7.sql`
   - `04_createTables.sql` -> `createTables.sql`
   - `07_triggers.sql` -> `triggers.sql`
   - `08_syncIgnoreDuplicateInsertTriggers.sql` -> `syncIgnoreDuplicateInsertTriggers.sql`

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
