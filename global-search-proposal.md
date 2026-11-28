# Proposal: global search across entities

Status: **proposal** (2026-11-28, nothing implemented). Revised the same
day, three times. The first draft matched ancestors by joining at query
time, too slow as data grows. The second kept them in a column on the
server and the browser, which makes every rename rewrite descendants on
the server and ship them through Electric. The third kept the column **in
the browser only**. Decided since: the text holds the subproject and the
places, not the project.

All numbers below were measured, not estimated. The app's real schema —
the nine `src/sql/` files `tests/helpers/createTestDb.ts` loads — with the
dev database's rows in an in-memory PGlite under Node, the same WASM build
the browser runs in its worker: 17,047 rows, larger sizes being synthetic
copies.

## Goal

One search box that finds any entity the signed-in user may see —
projects, their subprojects, (sub-)populations, checks, actions, goals,
reports, taxa, files, people — and opens its form. Offline, like the rest
of the app.

Today the ways to an entity are the tree (one level per click, loaded
lazily), breadcrumbs, the per-table list filters and the map. The Home
page already promises "Du kannst deine Daten im hierarchischen Baum
durchsuchen" (`src/components/index.tsx:243`), but the tree has no search
input. apflora (apf2) has no global search either, only per-node label
filters. vermehrung is the single reference.

## What vermehrung does

`Header/Vermehrung/Search` + `modules/searchSync.ts` over there:

- A `react-select/async` header field, 600 ms debounce, results grouped
  by type with counts. Selecting one opens the form.
- For each of 9 tables a hand-written builder fetches every row, resolves
  labels (many per-row async lookups of parent labels) and builds a
  Fuse.js index. Fuse does the fuzzy matching.
- The indexes are cached per table, keyed on the table's sync watermark
  and its filter. That cache was added later as a performance fix, and
  the code documents its caveat: offline edits do not advance the
  watermark, so they are not found until the next sync.

It works, and two of its properties are worth keeping: typo tolerance and
finding a child by its parent's name.

## What already exists here and anticipates this

- **Labels are columns.** Almost every entity table has a `label` that is
  generated (`src/sql/createTables.sql`, e.g. `:800`, `:887`) or kept by
  a trigger (`src/sql/triggers.sql:594-638`) and synced or recomputed in
  PGlite. Nothing has to be resolved in app code, as in vermehrung.
- **Client-only SQL is an established pattern.**
  `src/sql/syncReplaceStaleUniqueRows.sql` opens with "CLIENT ONLY
  (pglite): not mirrored from backend/db/init" and is loaded by
  `src/components/SqlInitializer.tsx` alongside the mirrored files.
- **Parents are local before children arrive.** The initial sync runs in
  stages that each wait for the previous stage's apply
  (`src/modules/startSyncing.ts`). For live changes a child applied before
  its parent fails on its foreign key until the parent has arrived. So a
  row's ancestors exist when the row is applied.
- **Writes to the server name their columns.** An operation sends
  `{[column]: newValue, ...draft, updated_at, updated_by}` or a `draft`
  built from explicit fields (`src/modules/executeOperation.ts`), and
  `toPayload` forwards no `prev` copy of the row
  (`src/modules/applyOperations.ts:37-46`).
- **Triggers may do real work while a sync applies.**
  `src/sql/syncIgnoreDuplicateInsertTriggers.sql` does nothing else: it
  runs only while `electric.syncing` is set.
- **Text extensions.** PGlite 0.6.0 ships `unaccent` (12.7 KB) and
  `pg_trgm` (16.9 KB); both load in the browser build and are fetched
  only when registered. Neither is used yet.
- **Routing.** `ownFormRoute` (`src/modules/navigateToOwnForm.ts:14-41`)
  builds the typed form route for a place-scoped row, level 2 included.
  Navigating to a form opens the tree down to it and scrolls it into
  view (`src/components/TreeOpenNodesSetter.tsx`,
  `src/components/Tree/index.tsx:72-86`).
- **Header.** `MenuBar` children may pass a `width` and collapse into
  the hamburger when space runs out (`src/components/MenuBar/index.tsx`,
  used by `OfflineFiles`/`Online` in `Header/Menu.tsx:216-217`).
- **Building blocks.** Fluent `Dialog` (used in 10 places), `Listbox`,
  `Option` and `OptionGroup` are exported by the installed
  `@fluentui/react-components` 9.75.2.
- **Permissions.** A user only holds rows their roles allow
  (`src/modules/shapeDefinitions.mjs`). A search over local rows cannot
  reveal anything else, so no new permission path is needed.

## Why match ancestors at all

Own labels identify places — 1,405 distinct labels for 1,451 places in
the dev data — but not their rows. Checks and actions are labelled by
their date, reports by their year: 684 distinct labels for 2,499 checks
(the busiest date has 29), 37 for 2,705 check reports. Without the
place's name, the only way to a 2015 check is opening the place and
reading its list. "Hohwülflingen Süd 2015" should lead straight there.

That is the whole reason ancestor matching exists. Nothing else needs it,
and nothing else should pay for it.

## Measurements

**Own label, all entity groups** (median per query):

| Rows searched  | Plain scan | + trigram index | `unaccent` on both sides |
| -------------- | ---------- | --------------- | ------------------------ |
| 17k (dev data) | 9–12 ms    | 12–20 ms        | 14–17 ms                 |
| 182k           | 68–89 ms   | 31–51 ms        |                          |
| 840k           | 345–426 ms | 131–217 ms      |                          |

Fuse.js over the same 12,166 labels: 23 ms to build the index, then
**26–62 ms per search on the main thread**.

**"Place name + year"** — the checks, actions and reports of one place in
one year, three ways to find them (all entity groups in the database):

| Rows searched  | Join ancestors at query time | Two-step: places, then FK index | **Ancestors stored in the row** |
| -------------- | ---------------------------- | ------------------------------- | ------------------------------- |
| 17k (dev data) | 8.6 ms                       | 4.0 ms                          | **1.7 ms**                      |
| 182k           | 71 ms                        | 28 ms                           | **5 ms**                        |
| 840k           | 319 ms                       | 164 ms                          | **20 ms**                       |

`EXPLAIN` shows the trigram index in use at all three sizes. Unindexed,
the stored column is 12 ms at 17k rows: its text is about ten times
longer than a label.

**The browser-only column as prototyped** (folded text, the five tables
that carry it):

| Query                                        | 9.7k rows | ~107k rows | ~495k rows |
| -------------------------------------------- | --------- | ---------- | ---------- |
| "Hohwülflingen Süd 2015", typed without ü    | 2.3 ms    | 17.1 ms    | 15.5 ms    |
| "abies", a name shared by a whole subproject |           | 22.2 ms    | 28.4 ms    |
| a place by its own name                      |           | 3.6 ms     | 1.6 ms     |
| a bare year on checks, `label` indexed       |           | 3.1 ms     | 12.6 ms    |

The bare year is 13 ms and 63 ms without the index on `label`.

**What it costs to keep the column, per row applied** (rows arriving with
`electric.syncing` set, as a real sync does; median of five runs):

| Table                     | Today      | With the column | Added      |
| ------------------------- | ---------- | --------------- | ---------- |
| places (1,451 rows)       | 41 µs      | 107 µs          | +65 µs     |
| checks (2,499)            | 28 µs      | 52 µs           | +24 µs     |
| actions (699)             | 30 µs      | 89 µs           | +59 µs     |
| check_reports (2,705)     | 15 µs      | 35 µs           | +20 µs     |
| action_reports (2,348)    | 18 µs      | 36 µs           | +18 µs     |
| **all five (9,702 rows)** | **236 ms** | **524 ms**      | **+30 µs** |

The trigram indexes are not the cost. A run without them took 544 ms
against 554 ms with them (measured on the earlier variant of the trigger,
which also read the project name). It is the lookups in the triggers.

**A rename arriving through sync.** The server ships one row; everything
else is local work in the worker:

| Renamed                           | Rewritten locally | Time   | `updated_at` changed |
| --------------------------------- | ----------------- | ------ | -------------------- |
| a level-2 place                   | 1 row             | 3 ms   | 0 rows               |
| the biggest level-1 place         | 523 rows          | 31 ms  | 0 rows               |
| the biggest subproject            | 7,988 rows        | 523 ms | 0 rows               |
| a project                         | nothing           | 1 ms   | 0 rows               |
| a place re-synced, name unchanged | nothing           | 0 ms   | 0 rows               |

After all of these the prototype had 0 stale rows.

## Decisions

### D1 — engine: one SQL query in PGlite (recommended)

**A. Port vermehrung's design** (Fuse.js over a per-table corpus). Keeps
Fuse's fuzzy multi-key matching. Costs: two new dependencies (`fuse.js`
plus a select component or a custom list), roughly 500 lines of
per-entity builders that duplicate what the triggers already compute, a
cache with an invalidation scheme this app does not have (there is no
`lastUpdatedAtom` here), main-thread work on every keystroke, and the
same offline-staleness caveat.

**B. One SQL query** over a declarative list of entities (recommended).
Each entity contributes one `UNION ALL` arm returning the same columns:
entity, id, label and the ids the route needs. Always current — including
edits that are still queued offline — because it reads the rows
themselves.

**C. A PostgREST RPC** doing the search on the server. Rejected: not
offline, one round trip per keystroke, and it would have to re-implement
the role scoping in SQL — a new permission surface for a
privacy-sensitive app.

**D. Full-text search** (`tsvector`). The `german` and `english`
configurations work in PGlite with stemming, but `french` and `italian`
fall back to `simple`, and it needs a stored column per table. It is 3–4×
the cost of `ILIKE` per row when computed on the fly, for little gain on
short labels.

### D2 — what a term matches (recommended)

- **Two characters minimum**, 200 ms debounce, stale answers dropped.
- **Every word must occur in the row's own label or in its
  `search_text`.** One word finds the entity itself and, for a place
  name, also its checks, actions and reports. Two words narrow:
  "Hohwülflingen Süd 2015" is that place's rows from 2015.
- **Case and accents don't matter for names.** `search_text` is
  stored folded — lower-case, accents removed — and the term is folded
  the same way before matching. Typing "zurich" finds "Zürich", and the
  index is usable. Labels (dates, years) match with `ILIKE`. Tables
  without the column match `unaccent(label) ILIKE unaccent($1)`.
- **What `search_text` holds:** the subproject's label, the parent
  place's label and name, and the place's own label and name. Not the
  project name: it is not needed, and it would turn a project rename into
  the largest cascade of all.
- **Places and projects also match their `name`**, because `label` is the
  raw UUID when a project has no `places_label_by` (23 of 1,451 places in
  the dev data). For places `search_text` contains the name, so one
  indexed predicate is enough.
- **Dates in any notation.** `19.3.2015`, `19-03-2015` and `2015-03-19`
  all match the label `2015.03.19`.
- **Ranked and capped:** exact, then prefix, then word start, then
  substring; 8 per group, group counts in the headings.

### D3 — how ancestors get into the row: a browser-only column (recommended)

**A. Join at query time.** 319 ms at 840k rows, paid by every row.
Rejected.

**B. Two-step lookup, no stored column.** Find the places whose name
matches, then their rows through the `place_id` index. 4.0 ms on dev
data, 164 ms at 840k rows. The fallback if no trigger is wanted.

**C. The column on the server and in the browser.** Synced rows arrive
with their value, so nothing is computed locally. But it is a backend
change (schema, shapes, a backfill at the end of every import), every
rename rewrites all descendants on the server, and Electric ships each
rewritten row to every client that holds it — 7,988 for the biggest
subproject in the dev data. Each client then applies them all, which
costs it at least what a local rewrite costs, plus the transfer. And the
history and `updated_at` triggers need `WHEN (pg_trigger_depth() < 1)` to
keep those rewrites out of Time Machine. That clause works (tested
against the real `versioning()`: a cascade of 20,000 rows then writes 0
history rows instead of 20,000), but it is one more thing to get right.

**D. The column exists only in PGlite (recommended).** The server has no
`search_text`, rewrites nothing and ships nothing extra. What one client
holds is all it needs: rows arrive with their ancestors already local
(sync stages and foreign keys), so a local trigger can compute the value
as each row is applied. Nothing in the backend changes — no schema, no
shapes, no deploy, no import backfill, no history clause. The price is
the per-row cost in the table above, about +30 µs on a step that costs
24 µs today, and local work when a rename arrives.

### D4 — `updated_at` on a local cascade (recommended)

PGlite has no history triggers, so a cascade writes no history. It would
still bump `updated_at` through `update_<table>_updated_at`, showing a
rename time on rows nobody edited. The local triggers for the five tables
get `WHEN (pg_trigger_depth() < 1)` — the clause the permission triggers
already use — so a rewrite by the cascade is not an edit. Measured: 0
rows changed in every rename above.

### D5 — typo tolerance: a second tier, as a follow-up (recommended)

A trigram-similarity pass that runs only when nothing matched, offered
as "Meinten Sie …". Measured cheap (4–5 ms per table with the index). I
would not hold v1 for it: the thresholds want tuning with real names, and
3-letter terms must not fuzzy-match.

### D6 — UI: a search palette (recommended)

**A. Inline header field**, like vermehrung. Best discoverability. But
the header is 44 px high with a dark green background, on phones there
is no room next to the pane toggles and the menu, so a second code path
(icon plus dialog) is needed anyway.

**B. A search palette** (recommended): a `Search` icon as a `MenuBar`
child — it collapses into the hamburger like the other header actions —
plus `/` and Ctrl+K. It opens a `Dialog` with a focused input and a
grouped `Listbox`. One code path for every width, room for the breadcrumb
under each label, and the familiar command-palette shape. The inline
field can be added later for wide screens without touching the engine.

### D7 — entities in v1 (recommended)

| In                                                           | Out, and why                                                              |
| ------------------------------------------------------------ | ------------------------------------------------------------------------- |
| projects, subprojects, places                                |                                                                           |
| checks, actions                                              | quantities, check/action taxa: value rows with synthetic labels           |
| goals, goal reports, subproject/project/check/action reports | observations: by far the largest table, labelled by an import setting     |
| taxa, files, charts, lists and list values                   | roles, form designs, field sorts, layer presentations: configuration rows |
| users                                                        | history tables: not synced                                                |

Only places, checks, actions and the two place-scoped reports carry
`search_text`. The rest match their own label.

## Design (for the recommended options)

### One client-only file: `src/sql/searchText.sql`

Like `syncReplaceStaleUniqueRows.sql`: not mirrored, loaded by
`SqlInitializer` and by `tests/helpers/createTestDb.ts`.

```sql
-- accent folding an index may use: unaccent() itself is only STABLE
CREATE OR REPLACE FUNCTION ps_fold(text) RETURNS text
LANGUAGE sql IMMUTABLE STRICT AS
$$ SELECT lower(unaccent('unaccent', $1)) $$;

ALTER TABLE places ADD COLUMN search_text text;   -- and four more tables
CREATE INDEX checks_search_text_idx
  ON checks USING gin (search_text gin_trgm_ops);
CREATE INDEX checks_label_idx ON checks USING gin (label gin_trgm_ops);
```

- `places.search_text`: the folded labels and names of the row's
  subproject, parent place and itself. The four child tables copy their
  place's `search_text`.
- A subproject's name is in every row below it because it is needed. The
  price is that a subproject rename rewrites all of them (see Caveats).
- The four child tables do **not** copy their own label — see the first
  rule under Triggers.
- Trigram indexes on `search_text`, and on `label` of the four child
  tables so that a bare year does not scan.
- `unaccent` and `pg_trgm` are registered in `src/pglite-worker.ts` only.
  The server does not need them.

### Triggers

- **Never read `NEW.label` in a `BEFORE INSERT` trigger.** It is a
  generated column and is computed after BEFORE triggers run. My first
  local prototype did, and every row that arrived through sync was
  missing its own date. That is why child rows match their label on the
  `label` column instead.
- **The row's own value in a `BEFORE` trigger**, so a row is written
  once: one lookup for the four child tables (the place already carries
  its ancestors), two for a place (its subproject and its parent place).
- **These triggers run during sync, on purpose.** Every other trigger
  returns early while `electric.syncing` is set because the synced row
  already holds its value. Here there is no server value to receive.
- **Descendants in an `AFTER` trigger with a `WHEN`** on the columns that
  matter. In `BEFORE` the renamed row is not visible yet (my first
  server prototype cascaded there and rewrote nothing). The `WHEN`
  matters because a synced update lists every column: without it, a place
  re-synced with an unchanged name would run the cascade.
- **Only rows whose value differs are rewritten.**
- **The cascade cannot break a sync.** It runs inside the apply
  transaction, where an exception stops the run. Its body is wrapped in
  `EXCEPTION WHEN OTHERS THEN RAISE WARNING`: a stale search value is
  better than a sync that will not apply.

AFTER triggers on `places` (name, label, parent_id, subproject_id) and
`subprojects` (name) rewrite what sits below, whether the change is the
user's own or arrives through sync. There is no trigger on `projects`.

### Keeping the column out of the server's way

`search_text` exists only in PGlite, so a payload containing it would be
rejected by PostgREST. Nothing builds such a payload today. As a guard
for later code, `executeOperation` and `applyOperations` drop a
`search_text` key from any `draft` before sending.

### Existing browsers

`SqlInitializer` loads the file once; triggers and indexes come with it.
Rows already local get the value from the same backfill the triggers
compute with, then the indexes are built: about 0.5 s and 0.13 s on the
dev data.

### `src/modules/globalSearch.ts`

A registry; each entry owns one arm and its route:

```ts
type SearchEntity = {
  key: string
  heading: MessageDescriptor // "Orte", "Kontrollen", …
  arm: (words: string[]) => string
  route: (hit: SearchHit) => { to: string; params: Record<string, string> }
}
```

`buildSearchSql(term)` normalises the term (trim, fold, escape `%` `_`
`\`, detect dates, split words) and assembles the arms:

```sql
WITH hits AS (
  -- one arm per registry entry; no joins
  SELECT 'places' AS entity, p.place_id AS id, p.label, p.place_id, p.parent_id
  FROM places p
  WHERE p.search_text LIKE '%hohwulflingen sud%'
  UNION ALL
  SELECT 'checks', c.check_id, c.label, c.place_id, NULL
  FROM checks c
  WHERE c.search_text LIKE '%hohwulflingen sud%' AND c.label ILIKE '%2015%'
  UNION ALL
  -- …
), ranked AS (
  SELECT *, row_number() OVER (PARTITION BY entity ORDER BY rank, label) AS rn,
         count(*) OVER (PARTITION BY entity) AS total
  FROM hits
)
SELECT * FROM ranked WHERE rn <= 8 ORDER BY rank, label
```

A second statement fetches the breadcrumb for the returned rows only,
joined on their ids. The search runs as a one-off `db.query`, not a live
query: a live query would re-run with the other mounted live queries
after every sync (`src/modules/gateLiveNotifyTriggers.ts:8-16`), and
live-query parameters go through `format()`, which mangles the `%` a
search term contains (`src/modules/orFilterToSql.ts:4-5`).

Place-scoped entries reuse `ownFormRoute` (its `ownTable` union grows by
the report and file kinds); level-2 rows pass `parent_id` through.

### UI: `src/components/GlobalSearch/`

- Trigger button in `Header/Menu.tsx`, a `MenuBar` child with
  `width={32}`. Global keydown listener for `/` and Ctrl+K that ignores
  it while typing in a field.
- Dialog with input, grouped results (`OptionGroup`), the match
  highlighted in the label, breadcrumb as secondary text, count per
  group. Arrow keys, Enter, Escape; focus returns to the trigger.
- Selecting a hit navigates and closes. **On phones it also activates
  the data pane** — the tree does not switch panes today, so without
  this the form would open behind the tree or map.
- No url state: the term is transient and is not registered in
  `urlSearchKeys.ts`.

### Tests, i18n, docs

- `tests/globalSearch.test.ts` on `createTestDb()`: grouping, caps,
  ranking, accents, escaped wildcards, date notations, level-2 parents,
  multi-word matching, route builders.
- `tests/searchText.test.ts` on `createTestDb()`: rows arriving with
  `electric.syncing` set get their value; rename of a place and of a
  subproject, the user's own and one arriving through sync; a project
  rename rewrites nothing; a place moved to another parent; a re-synced
  place with an unchanged name rewrites nothing; no `updated_at` bump on
  a cascade; a check created offline.
- `e2e/global-search.spec.ts`: open by icon and by shortcut, type a
  place name, hit shows group and breadcrumb, Enter opens the form, the
  tree is open to it; repeat with `context.setOffline(true)`; phone
  viewport: the icon sits in the hamburger.
- `e2e/offline-sync.spec.ts` must stay green: like the sync-repair
  triggers, these run inside the apply transaction.
- Strings in de/en/fr/it via `npm run i18n:extract`; a README bullet and
  a dev-documentation.md section.

## Caveats

- **Every place-scoped row costs more to apply.** About +30 µs on a step
  that takes 24 µs today, so the five tables take about twice as long in
  the worker. I measured that step in isolation; how much it adds to a
  real initial sync, which also waits on the network, I have not
  measured.
- **A subproject rename is the large one, by decision.** Its name is
  needed, so everything below it is rewritten: 7,988 rows and 0.52 s on
  the dev data, growing with the subproject, in the worker, on every
  client that holds those rows. Everything queued behind it waits. A
  project rename rewrites nothing; a place rename touches only its
  subtree (523 rows, 31 ms).
- **If subproject renames ever hurt**, the subproject's name can be
  dropped from the four child tables and found through places at query
  time. Measured as the two-step variant, a word that names a whole
  subproject then costs 26 ms at 182k rows and 136 ms at 840k.
- **Two-character terms cannot use the trigram index.** They fall back
  to a scan: fine at dev size, slower at 500k rows.
- **Checks and actions inside a table view** also have a
  `…/table-views/<id>/checks/<id>/check` url. v1 links the plain route;
  the plain list shows every check, so the form should open — confirm in
  the e2e spec.
- **Group headings are generic** ("Orte", "Kontrollen") because results
  span projects with different names for the same table.
- **Tables without `search_text`** are matched on their own label by a
  scan. They are the small ones; the biggest among them in the dev data
  is `taxa` with 4,513 rows. A generated folded column is the step if
  one of them grows.

## Effort sketch

1. `src/sql/searchText.sql`: fold function, five columns, nine indexes,
   triggers with their `WHEN` and `EXCEPTION` guards; registered in the
   worker, `SqlInitializer` and the test helper; backfill for existing
   browsers
2. `globalSearch.ts`: registry, term normalisation, query builder, route
   builders + unit tests; trigger tests
3. `GlobalSearch/`: trigger, dialog, grouped results, keyboard, phone
   pane switch, CSS module, i18n
4. Strip `search_text` in the two operation senders
5. e2e spec, `npm run verify`, the sync e2e, README and dev docs

Roughly 2–2.5 days including verification, all of it in the frontend.
D5 is another 2–3 hours.

## Follow-ups this design makes cheap

- Typo tier (D5)
- Searchable custom fields: add a project's chosen field names to the
  place's `search_text` (measured on today's schema: 1.3 → 2.7 ms for
  three targeted fields)
- Observations and goals with a `search_text` of their own, one registry
  entry each
- A "current project only" switch (hits already carry `project_id`)
- Inline header field on wide screens
