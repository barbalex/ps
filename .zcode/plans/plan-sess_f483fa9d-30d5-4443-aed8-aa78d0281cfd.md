# Project-report overview building blocks (apflora Jahresbericht)

Adds the overview parts that precede the per-species reports. Two are integrated directly into the print view (not draggable), three become data-driven Puck blocks ported 1:1 from apf2's `ApberForYear` (`AvList`, `ErfolgList`, `AktPopList` + the `jber_abc`/`jber_akt_pop` SQL).

## Directly in the report (`projectReport/Print.tsx`)

- **Title block**: project name, `Jahresbericht {year}`, current date — rendered above the Puck design output (styled like apf2's title page; no logo asset).
- **Zusammenfassung**: free-text field on `project_reports.data.zusammenfassung`, rendered directly (pre-wrap). Seeded as a `fields` row (`table_name='project_reports'`, textarea widget) in `11d_seedApfloraReport.sql` so the report form offers it for editing.

## New module `src/formsAndLists/projectReport/projectReportComponents.tsx`

- `ProjectReportContext { projectId, year }` (analogous to `SubprojectReportContext`).
- **`ArtVerantwortlicheBlock`** — table grouped by `subprojects.data->>'bearbeiter'` (apf2: `ap.bearbeiter` resolved to adresse name), names sorted, arts sorted within; name shown on first row of group, empty cell after (apf2 `AvList`).
- **`ErfolgBlock`** — matrix `Erfolg {year}`, one row per art (sorted by name), columns: Art | nicht | wenig | mässig | gut | sehr | Veränderung | unsicher | nicht beurteilt | keine Massnahme im Berichtsjahr | Aktionsplan erstellt. Ported from `jber_abc`/`ErfolgList`:
  - `erfolg` = sort of the art's report-year `beurteilung` text, but only if the art has ≥1 as-of-year qualifying pop (status <300, bekannt_seit ≤ year) with ≥1 qualifying tpop (status <300, apber_relevant, bekannt_seit ≤ year) — else `null` → X under "nicht beurteilt". Text→sort: sehr erfolgreich=1, erfolgreich=2, mässig erfolgreich=3, wenig erfolgreich=4, nicht erfolgreich=5, unsichere Entwicklung=6.
  - `Veränderung` vs previous-year report's beurteilung: either 6 or missing → blank; equal → blank; worse → `―`; better → `╋`.
  - "keine Massnahme im Berichtsjahr": X when zero qualifying as-of pops have an action (typ non-null) in the year (local `actions`, year-filtered, distinct parent).
  - "Aktionsplan erstellt": X when `data->>'bearbeitung' = 'erstellt'`.
  - Colored header/X cells like apf2 (red/orange/yellow/cyan/green/gray).
- **`AktuellePopulationenBlock`** — "Übersicht über aktuelle Populationen aller AP-Arten": per art, as-of-year pop counts with ≥1 apber-relevant, by-then-known tpop (NO tpop-status filter — `jber_akt_pop` rule): ursprünglich (status 100), angesiedelt (status 200), total (100+200), plus the same as difference to previous year (as-of previous-year snapshots, `bekannt_seit` gated per that year); green/red diff cells; totals row (art count + column sums).
- As-of data: `useReportVersions`' react-query cache reused project-wide via `useQueries` with the same `['reportVersions', subprojectId]` keys — no duplicate fetching vs the per-art sections below. Subproject rows, current/previous-year reports, and year-actions come from local `useLiveQuery`.
- Pure helpers (`erfolgSortOf`, `veränderung`, `popCountsAsOfYear`) exported for unit tests.

## Wiring

- `projectReportDesign/Form.tsx`: new "Bausteine" category with the three blocks (editable `title` props, defaults matching apf2 headings); add `iframe={{ enabled: false }}` to `<Puck>` (live queries/context in preview — same reason as `subprojectReportDesign/Form.tsx:389`); provide `ProjectReportContext` (project id + latest report year, added to the existing query).
- `projectReport/Print.tsx`: spread the blocks into the Puck config; wrap `<Render>` in `ProjectReportContext.Provider` (projectId, row.year); render title block + Zusammenfassung above it.
- CSS module mirroring `reportComponents.module.css` conventions (`.shell` page-break-inside avoid, `.table` thead repeat, colored cells).

## Tests & validation

- Vitest for the pure helpers (beurteilung→column mapping, Veränderung symbols incl. unsicher/null rules, pop counts + diffs from fixture `VersionedRow` versions mirroring the jber rules).
- Seed the `zusammenfassung` field and apply to the dev DB; open the apflora report 2025 print in the browser, drag the blocks into the design, and spot-check against the PDF (Aldrovanda 0/10/10 with diffs 0/−1/−1; Pulsatilla X under "wenig", no Veränderung; Daphne `╋`).
- Full suite, tsc, eslint, sync-sql.

## Not in scope

- apf2's fnslogo on the title page (no asset in ps); markdown rendering of Zusammenfassung (plain pre-wrap); the Erfolg table's art-name truncation workaround.