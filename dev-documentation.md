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

One upside is: inside css modules nesting is not possible for classes.

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

1.  User owns own user row, related accounts, projects and other data
2.  Roles are (from high to low): owner, designer, writer, reader
3.  Projects, subprojects and places have `..._users` tables to set a user's role
4.  A users role always includes all the lower roles. They are not separately set, only a single role is set
5.  (Only) Owners can set designer roles
6.  (Only) Owners and designers can set writer and reader roles
7.  Only triggers set owner roles, users can't
8.  When a role is set, it's effect extends down all relations (n-sides) - even if (which should not happen) it has not been set in a `..._users` table in between.
9.  Setting lower rights at a lower level is not expected. Example: When a user has reader role on project, all its data can be synced without checking lower levels
10. Higher rights can be given at lower levels, their effect extending down as well. Example: A reader who shall be writer on a subproject needs the reader role on its project to sync in parent data
11. Setting lower roles at higher levels after having set higher ones lower down will nuke higher roles at lower levels. That's a problem we will have to live with? Will have to inform users if this happens in projects/subprojects
12. Owners are recognized by the 'owner' role given (the trigger that sets the owner roles uses above definition of what a user owns)

## Implementation

1.  Read above rules to understand why and how to implement
2.  We do not need sql to migrate existing implementations. After this rebuild we will rebuild the (experimental) production server from scratch
3.  account_id is currently part of many tables. In most cases it is redundant and should be removed. Keep it in: accounts and projects. Ensure there is no code left referencing it
4.  Roles: Change `user_roles_enum` to be `('reader', 'writer', 'designer', 'owner')`. Add them in this order to make this the official, sortable and comparable order (https://www.postgresql.org/docs/current/datatype-enum.html#DATATYPE-ENUM-ORDERING)
5.  Ensure code using user_roles_enum is updated, i.e. /home/alex/Documents/GitHub/ps/src/modules/constants.ts.userRoleOptions, /home/alex/Documents/GitHub/ps/backend/db/init/10_seedGeneralTestData.sql (manager role no more needed as trigger will set owner), comments in createTables sql files, /home/alex/Documents/GitHub/ps/src/components/Tree/Project/Editing.tsx.userMayDesign, /home/alex/Documents/GitHub/ps/src/formsAndLists/project/DesigningButton.tsx.userMayDesign. Ensure the previous roles are no more used anywhere and replaced in a meaningful way
6.  Ensure a user can have only a single role in a `..._users` table (combination of parent table id and user_id must be unique)
7.  Build on update, on insert and on delete of `..._users` tables triggers to upsert or remove roles in lower (n-side) `..._users` tables
8.  On insert triggers in projects set this users role to 'owner'
9.  On insert triggers in subprojects and places tables fetch and set this users roles from the parent (next up in the hierarchy) `..._users` table
10. Ensure triggers dont cascade recursively: use `pg_trigger_depth()` (https://www.postgresql.org/docs/9.2/functions-info.html) to only run on `WHEN (pg_trigger_depth() < 1)`. See: https://stackoverflow.com/a/14262289/712005 and https://dba.stackexchange.com/a/163152/51861. Beware: this will not work in casee where the spreading trigger _should_ react to a different trigger. Which _is_ what we want: only run when a user (with the needed rights) changes rights. The trigger thus has to update ALL lower level `..._users` tables
11. Ensure these triggers do not run on sync (using `current_setting('electric.syncing', true)` as for instance in observation_imports_label_creation_trigger)
12. Add subqueries (https://electric-sql.com/docs/guides/shapes#subqueries-experimental) to shape params in /home/alex/Documents/GitHub/ps/src/modules/startSyncing.ts to ensure only allowed rows are synced in (user has reader or higher role in the relevant parent table which is projects, subprojects or places set in the respective xxx_users table). Keep an eye on whether these subqueries are reasonable or if we need to create user-hidden xxx_users tables fed by triggers
13. Alter app side write operations to respect roles and surface when writer or higher role is missing
14. Alter postgrest API requests to send an authorization header that is checked on the server. Return meaningful messages if authorization fails. App-side roll back operation. Done: JWT Bearer token sent on all PostgREST writes; JWT errors invalidate the token cache and notify the user; permission-denied (42501) errors revert the optimistic change in PGlite, remove the queued operation, and show a notification. See `src/modules/fetchPostgrestToken.ts`, `executeOperation.ts`, `observeOperations.ts`.
15. Alter postgrest API to ensure user may run this write operation according to the rules above. If not return a meaningful message which is surfaced in the ui and rolls back the operation that caused it Done: `backend/db/init/12_writePermissionTriggers.sql` adds BEFORE triggers (`WHEN pg_trigger_depth() < 1`) on all project/subproject/place-scoped tables. Each trigger reads the JWT `user_id` via `get_jwt_user_id()`, checks the role hierarchy via `user_can_write_project` / `user_can_write_subproject` / `user_can_write_place`, and raises a `42501` exception with a descriptive message + hint if access is denied. `*_users` tables require designer+ via `user_can_manage_*_roles` helpers. ElectricSQL sync is skipped via `is_electric_sync()`. The app-side `42501` handler in `observeOperations.ts` surfaces the hint text and reverts + removes the operation.
16. Alter electric-sql endpoint to accept only authorized requests: https://electric-sql.com/docs/guides/auth#proxy-auth
    - Added `GET /auth/electric/check` to both auth servers: stateless HS256 JWT verify using `PGRST_JWT_SECRET`, no DB lookup
    - Dev `Caddyfile`: `forward_auth @notOptions localhost:3003 { uri /auth/electric/check }` on the `localhost:3001` Electric proxy
    - Prod `backend/caddy/Caddyfile`: same `forward_auth` on both `sync.xn--arten-frdern-bjb.app` and `sync.promote-species.app`
    - `startSyncing.ts`: fetches the PostgREST JWT via `fetchPostgrestToken()` at startup and passes it as `Authorization: Bearer` header to every shape subscription via the `Object.fromEntries` shape map

17. Critical for speed: Updates on role changes high up in the hierarchy: should happen batched
18. Critical for speed: Sync subqueries
19. Critical for speed: Write checks, especially when data is imported. Batch imports!
20. Most critical for speed: Ensure that changing a role does not lead to re-syncing already synced rows other than `..._users` or for users not involved. This rules out the array-column per role approach!

You can now log in at the dev backend as alex.barbalex@gmail.com / test-test1 and see all the seeded data

# 7 Documentation

## Goals

- we want the user to find documentation on the /docs route
- we will also link to docs from many pages inside the app
- a docs url should be: /docs/{doc title slugified to lowercase, spaces to -}
- this route needs no login nor database thus it will always load very fast
- for navigation we have a symbol-button in the app header (home: left of enter, data: left of online). It links to /docs
- metadata for docs is stored in an array of objects in a metadata.ts file with these keys: 1. id: {doc title slugified to lowercase, spaces to -} 2. label (= title) 3. order 4. isTechnical
- the menu list is on the left (similar to the nav tree in /data). It can be filtered by: all, contentual, technical (these three are mutually exclusive - only one can be choosen, default is all), text (label)
- docs are rendered on the right
- under 1000px view width ony the menu list is rendered (/docs) or the doc (/docs/doc-id)
- give the 1000px some wiggle to prevent the ui from jumping back and forth near this width value
- Doc sources live in two subfolders of `docs/`:
  - `docs/docsMd/` — docs written in Markdown (converted to HTML by the build script)
  - `docs/docsHtml/` — docs written directly in HTML (copied as-is by the build script)
- A build script (`scripts/build-docs.mjs`, run via `npm run docs:build`) combines both source folders into `docs/docs/` — **do not edit files in `docs/docs/` manually**
- The app imports the pre-built `.html` fragments — no runtime Markdown parsing, docs render instantly
- Shared assets (metadata, CSS) live directly in `docs/`
- there exists standard css to style docs similarly and simplify their creation. Things prestyled could be: ol, ul, p, h1, h2, h3. We can add to this later when we use it
- docs will not be added in the ui but by devs in dev mode. Thus they need not editing functionality
- TODO: links in docs should always open in a new tab
- docs need to exist in de, en, fr and it. They will be written in either de or en. the writer creates the four files, adds the language to the file name. The metadata contains the label in four versions, fallback is label_de (later could be added to the docs:build script?)

## Implementation

---

### Step 2 — Build script and standard docs CSS

Create `scripts/build-docs.mjs`:

- Clears `docs/docs/`.
- Reads every `docs/docsMd/*.md` file, converts each to an HTML fragment using `marked` with a custom renderer that adds `target="_blank"` to every `<a>` tag, writes to `docs/docs/{id}.html`.
- Copies every `docs/docsHtml/*.html` file into `docs/docs/`, post-processing each to add `target="_blank"` to every `<a>` tag that doesn't already have a `target` attribute.

Convention: when writing HTML docs in `docs/docsHtml/`, always add `target="_blank"` to links manually so the source is readable without running the script.

Add to `package.json` scripts:

```json
"docs:build": "node scripts/build-docs.mjs"
```

Create `docs/docs.css` with pre-styled base elements:

```css
.doc h1 { … }
.doc h2 { … }
.doc p  { … }
.doc ol, .doc ul { … }
/* etc. */
```

Use a `.doc` wrapper class so styles are scoped and don't bleed into the app shell.

Verify: running `npm run docs:build` with empty `docs/docsMd/` and `docs/docsHtml/` directories exits without errors and `docs/docs/` is empty.

---

### Step 9 — In-app links

Add contextual links from relevant app pages to their corresponding doc page using `<Link to="/docs/$docId">`. Start with pages that already have a related doc.

Verify: link renders and navigates to the correct doc.

---

### Step 10 — Additional docs

For each new doc:

1. Write the source in `docs/docsMd/{id}_de.md` (Markdown) or `docs/docsHtml/{id}_de.html` (HTML)
2. Add `docs/docsHtml/{id}_en.html`, `docs/docsHtml/{id}_fr.html` and `docs/docsHtml/{id}_it.html`
3. Add an entry to `docs/metadata.ts`
4. Run `npm run docs:build`
5. Commit the source file, the generated `docs/docs/{id}.html`, and the updated `docs/metadata.ts`

## Things to document
