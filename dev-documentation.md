# 0. Developer Documentation

This file serves the developer(s) and coding AI. It's goals are:

1. ensure consistent coding
2. facilitate introducing new devs / AI's

# 1. Styling

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

Is this better than using css modules? Migrating would be a chore, so let's not do it now.

# 2. SQL Source Of Truth And Sync

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
  - `generate_apflora_seed_sql.mjs`
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
   - `generate_apflora_seed_sql.mjs`
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
2. If editing Apflora taxonomy CSVs in `seed-data/apflora/`, regenerate the seed file:

```bash
node backend/db/generate_apflora_seed_sql.mjs
```

This rewrites:

- `backend/db/init/11_seedApfloraTaxonomies.sql`

3. Run `npm run sync-sql`.
4. Commit changes.

If commit fails on SQL sync check:

1. Run `npm run sync-sql`.
2. Re-stage updated files.
3. Commit again.

## Generated Seed Files

- `backend/db/init/09_seedQcs.sql`
  Regenerate with: `node backend/db/generate_qcs_sql.mjs`
- `backend/db/init/11_seedApfloraTaxonomies.sql`
  Regenerate with: `node backend/db/generate_apflora_seed_sql.mjs`

## Files Involved

- Sync script: `scripts/sync-sql.mjs`
- Hook installer: `scripts/install-git-hooks.mjs`
- Hook file: `.githooks/pre-commit`
- NPM scripts: `package.json`

# 3. Login

## Email and Password

### Register

### Log in

### Change password

### Forgot Password

## OAuth, Social sign-on (SSO)

## Add password after registering with OAuth

# 4. App Admin Access

App-admin access is configured via frontend env variable:

- `VITE_APP_ADMIN_EMAILS`

Format:

- Comma-separated email list
- Example: `VITE_APP_ADMIN_EMAILS=alex@gabriel-software.ch,alex.barbalex@gmail.com`

Behavior:

- Emails are trimmed and compared case-insensitively.
- If the variable is empty or missing, nobody is treated as app admin.
- Do not hardcode admin emails in routes/components. Use `src/modules/appAdmins.ts`.

# 5. Authentication Flow

## Registration

Users register with email, password, and an auto-derived display name (the local part of the email address). The `name` field is required by the backend and is set automatically — the frontend derives it from the email before calling `signUp.email()`.

After successful registration the user is taken to the sign-in form and shown a success message advising them to check their email.

## Email Verification Grace Period

New users can log in immediately after registration without verifying their email. They have **1 hour** from account creation to complete verification before they are automatically signed out.

### How it works

1. **Grace window** — defined in `src/modules/emailVerificationGrace.ts`:
   - `EMAIL_VERIFICATION_GRACE_MS = 60 * 60 * 1000` (1 hour)
   - `getVerificationDeadlineMs(user)` — returns `user.createdAt + 1 hr` or `null` if already verified or missing
   - `isVerificationGraceExpired(user, nowMs?)` — returns `true` when deadline has passed

2. **Route guard** — `src/routes/data/route.tsx` `beforeLoad` checks `isVerificationGraceExpired`. If expired, it redirects to `/auth?verificationExpired=true`, which shows an error message on the auth page.

3. **In-app banner** — `src/components/EmailVerificationBanner.tsx`, mounted in `src/components/LayoutProtected/index.tsx`:
   - Visible whenever the session user has `emailVerified: false` and is still within the grace window.
   - Shows a live countdown (`HH:MM:SS`) to forced logout.
   - **Resend** button — POSTs `{email, type: 'email-verification'}` to `/auth/email-otp/send-verification-otp`.
   - **OTP input + Verify** button — POSTs `{email, otp}` to `/auth/email-otp/verify-email`; reloads the page on success.
   - When the countdown reaches zero, `signOut()` is called automatically and the user is redirected to `/auth?verificationExpired=true`.

### Relevant files

| File                                                | Purpose                                                                       |
| --------------------------------------------------- | ----------------------------------------------------------------------------- |
| `src/modules/emailVerificationGrace.ts`             | Grace window helpers & expiry check                                           |
| `src/components/EmailVerificationBanner.tsx`        | Countdown banner with resend + OTP verify                                     |
| `src/components/EmailVerificationBanner.module.css` | Banner styles                                                                 |
| `src/routes/data/route.tsx`                         | Route guard that enforces expiry                                              |
| `src/routes/_layout.auth.tsx`                       | Adds `verificationExpired` search param to auth route                         |
| `src/components/Auth.tsx`                           | Shows grace-expired error and post-signup success message                     |
| `backend-dev/auth/auth.mjs`                         | `requireEmailVerification` controlled by `REQUIRE_EMAIL_VERIFICATION` env var |

### Dev environment note

In `backend-dev`, email verification is **disabled by default** (`REQUIRE_EMAIL_VERIFICATION` env var defaults to `false`). This means new users can log in without any OTP step.

To test the full OTP flow locally when Mailgun is not configured, check the auth container logs — the OTP is printed there:

```bash
docker compose logs auth --tail 50
```

To enable verification in dev, set `REQUIRE_EMAIL_VERIFICATION=true` in the dev environment and restart the auth container.

## Removing a User

A user can delete their own account from the user form (`src/formsAndLists/user/index.tsx`) in the **Data** section.

### What happens

1. A confirmation dialog (`src/formsAndLists/user/DeleteAccountDialog.tsx`) warns the user that deletion is **permanent and irreversible**, and hints that they can export their data first.
2. On confirmation, a `DELETE FROM users WHERE user_id = $1` is sent directly to the PostgREST API (`constants.getPostgrestUri()`). Referential integrity (cascade deletes) removes all related data server-side.
3. After a successful delete, `clearLocalSyncedData()` is called to wipe local PGlite state, IndexedDB databases, browser caches and persisted localStorage.
4. The browser is redirected to `/`.

### Relevant files

| File                                             | Purpose                                         |
| ------------------------------------------------ | ----------------------------------------------- |
| `src/formsAndLists/user/index.tsx`               | "Delete account" button in the Data section     |
| `src/formsAndLists/user/DeleteAccountDialog.tsx` | Confirmation dialog; executes the delete + wipe |
| `src/modules/clearLocalSyncedData.ts`            | Clears all local sync state and caches          |

# 6 User Roles

## Rules

1. User owns own user row, related accounts, projects and other data
2. Right levels (from high to low): design (only at project level), write, read
3. (Only) Owners can set design rights
4. (Only) Owners and designers can set writer and reader rights
5. When a right is set, it extends down (to the n-sides) of all relations
6. Higher rights can be given at lower levels, again extending down
7. Setting lower rights at a lower level is not expected. Example: When a user has reader role on project, all its data can be synced without checking lower levels
8. Projects, subprojects and places get right columns: readers, writers, designers (only on projects)
9. Hopefully this is enough for efficient sync subqueries. If not, we will later need to spread roles to more tables
10. Owners get all rights
11. Designer roles are solely reserved for projects. Designers also get writer and reader roles
12. Writers also get reader roles
13. On update triggers add lower roles and spread roles down. Ensure previous roles are completely replaced! Ensure trigger-caused updates dont trigger cascading trigger orgies. TODO: how? (only) app sets levels, triggers only spread levels down the hierarchy?
14. On insert triggers fetch and set this users roles from parent row
15. Subqueries (https://electric-sql.com/docs/guides/shapes#subqueries-experimental) ensure a user syncs only allowed data (only query reader role). Query speed is essential thus array columns for readers and writers
16. write operations ensure writer roles. Only client side? optimally: client AND express/postgrest api side. But speed? See: https://electric-sql.com/docs/guides/auth
17. critical for speed: updates on role changes high up in the hierarchy: should happen batched?
18. critical for speed: sync rules
19. critical for speed: write checks, especially when data is imported. Batch operations for write on imports!

## Implementation

1. Remove existing xxx_users tables (project_users, subproject_users, place_users), related code, routes, tree navs, breadcrumbs, list views, forms and subforms
2. Add new rights columns. tables: projects, subprojects, places. columns: designers (only projects), writers, readers
3. TODO:
