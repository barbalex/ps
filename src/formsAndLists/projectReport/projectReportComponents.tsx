/* eslint-disable react-refresh/only-export-components -- this file intentionally bundles components with contexts and helpers */
import { createContext, useContext } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useQueries } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import type { Config } from '@puckeditor/core'

import {
  asOfYear,
  reportVersionsOptions,
  statusCode,
  type VersionedRow,
} from '../../components/shared/reportVersions.ts'
import { onlineAtom } from '../../store.ts'
import styles from './projectReportComponents.module.css'

/**
 * Data-driven building blocks for project report designs: the overview
 * parts of apf2's yearly report (ApberForYear) that precede the per-art
 * reports — Artverantwortliche, the Erfolg matrix and the overview of
 * current populations. The components query the local database themselves
 * (live queries), scoped by the report context — the project and year
 * being reported. Like the subproject blocks they are used both in the
 * design editor (preview) and the report print.
 */

export type ProjectReportContextValue = {
  projectId?: string
  year?: number | null
}

export const ProjectReportContext = createContext<ProjectReportContextValue>({})

export const useProjectReportContext = () => useContext(ProjectReportContext)

const NoContext = ({ label }: { label: string }) => (
  <div className={styles.noContext}>{label}: kein Projekt-Kontext</div>
)

const Loading = () => <div className={styles.loading}>wird geladen…</div>

// ---------------------------------------------------------------------------
// shared data

type ArtRow = {
  subproject_id: string
  name: string | null
  bearbeiter: string | null
  bearbeitung: string | null
}

const useArts = (projectId: string | undefined) => {
  const res = useLiveQuery(
    `SELECT subproject_id, name,
       data ->> 'bearbeiter' AS bearbeiter,
       data ->> 'bearbeitung' AS bearbeitung
     FROM subprojects
     WHERE project_id = $1
     ORDER BY name`,
    [projectId ?? null],
  )
  return (res?.rows ?? []) as unknown as ArtRow[]
}

type ReportRow = {
  subproject_id: string
  year: number | null
  beurteilung: string | null
}

/** the arts' reports of the report year and the previous year */
const useYearReports = (
  projectId: string | undefined,
  year: number | null | undefined,
) => {
  const res = useLiveQuery(
    `SELECT r.subproject_id, r.year, r.data ->> 'beurteilung' AS beurteilung
     FROM subproject_reports r
       INNER JOIN subprojects s ON r.subproject_id = s.subproject_id
     WHERE s.project_id = $1 AND r.year IN ($2, $3)`,
    [projectId ?? null, year ?? null, year != null ? year - 1 : null],
  )
  return (res?.rows ?? []) as unknown as ReportRow[]
}

type PlaceRow = {
  place_id: string
  parent_id: string | null
  level: number | null
  since: number | null
  status: string | null
  relevant: boolean
}

const placeRowsFromVersions = (
  places: VersionedRow[],
  year: number,
): PlaceRow[] =>
  asOfYear(places, year, 'place_id').map((place) => {
    const data = place.data as Record<string, unknown> | null
    return {
      place_id: place.place_id as string,
      parent_id: (place.parent_id as string | null) ?? null,
      level: (place.level as number | null) ?? null,
      since: (place.since as number | null) ?? null,
      status: (data?.status as string | null) ?? null,
      relevant:
        place.relevant_for_reports == null
          ? true
          : !!place.relevant_for_reports,
    }
  })

/** current local place rows per art (fallback while offline or yearless) */
const useLivePlaceRowsByArt = (
  projectId: string | null | undefined,
): Map<string, PlaceRow[]> => {
  const res = useLiveQuery(
    `SELECT place_id, parent_id, level, since, data ->> 'status' AS status,
       COALESCE(relevant_for_reports, TRUE) AS relevant, subproject_id
     FROM places
     WHERE subproject_id IN (SELECT subproject_id FROM subprojects WHERE project_id = $1)`,
    [projectId ?? null],
  )
  const byArt = new Map<string, PlaceRow[]>()
  for (const row of (res?.rows ?? []) as unknown as (PlaceRow & {
    subproject_id: string
  })[]) {
    const { subproject_id, ...place } = row
    const list = byArt.get(subproject_id) ?? []
    list.push(place)
    byArt.set(subproject_id, list)
  }
  return byArt
}

/**
 * As-of-year place rows per art, for several years at once (the report year
 * and the previous year for difference columns). The historized versions
 * come from the same react-query cache the per-art report sections use — no
 * duplicate fetching. While online and not every art's versions have
 * arrived yet, the hook reports loading; offline (or without years) it
 * falls back to the current local state.
 */
const usePlaceRowsByArt = (
  projectId: string | undefined,
  arts: ArtRow[],
  years: number[],
): {
  rowsByArtByYear: Map<number, Map<string, PlaceRow[]>>
  loading: boolean
} => {
  const online = useAtomValue(onlineAtom)
  const needsVersions = online && years.length > 0 && arts.length > 0
  // a null projectId matches no rows — the live fallback is not needed then
  const liveByArt = useLivePlaceRowsByArt(needsVersions ? null : projectId)
  const queries = useQueries({
    queries: needsVersions
      ? arts.map((art) => reportVersionsOptions(art.subproject_id, online))
      : [],
  })

  if (!needsVersions) {
    return {
      rowsByArtByYear: new Map(years.map((year) => [year, liveByArt])),
      loading: false,
    }
  }
  if (queries.some((query) => query.isPending)) {
    return { rowsByArtByYear: new Map(), loading: true }
  }
  const rowsByArtByYear = new Map<number, Map<string, PlaceRow[]>>()
  for (const year of years) rowsByArtByYear.set(year, new Map())
  arts.forEach((art, index) => {
    const places = (
      queries[index]?.data as { places?: VersionedRow[] } | undefined
    )?.places
    if (places) {
      for (const year of years) {
        rowsByArtByYear
          .get(year)!
          .set(art.subproject_id, placeRowsFromVersions(places, year))
      }
    }
  })
  return { rowsByArtByYear, loading: false }
}

// ---------------------------------------------------------------------------
// pure helpers (exported for tests)

/** apf2 ap_erfkrit_werte.sort for a beurteilung text (1=sehr … 6=unsicher) */
export const erfolgSortOf = (
  beurteilung: string | null | undefined,
): number | null => {
  switch (beurteilung) {
    case 'sehr erfolgreich':
      return 1
    case 'erfolgreich':
      return 2
    case 'mässig erfolgreich':
      return 3
    case 'wenig erfolgreich':
      return 4
    case 'nicht erfolgreich':
      return 5
    case 'unsichere Entwicklung':
      return 6
    default:
      return null
  }
}

/**
 * apf2 ErfolgList: comparison of this year's and last year's erfolg sort.
 * Unsicher (6) or a missing year compares to nothing; a higher sort value
 * is worse (―), a lower one better (╋).
 */
export const veränderung = (
  erfolg: number | null,
  erfolgVorjahr: number | null,
): string => {
  if (erfolg == null || erfolgVorjahr == null) return ''
  if (erfolg === 6 || erfolgVorjahr === 6) return ''
  const diff = erfolg - erfolgVorjahr
  if (diff === 0) return ''
  return diff > 0 ? '―' : '╋'
}

export type PopYearCounts = {
  pop100: number
  pop200: number
  total: number
}

/**
 * apf2 jber_akt_pop: populations as of the year with at least one
 * report-relevant, by-then-known tpop — WITHOUT a tpop status condition —
 * split by pop status: 100 ursprünglich, 200 angesiedelt.
 */
export const popCountsAsOfYear = (
  rows: PlaceRow[],
  year: number,
): PopYearCounts => {
  const knownTpopsByPop = new Map<string, number>()
  for (const tpop of rows) {
    if (tpop.level !== 2) continue
    if (!tpop.relevant) continue
    if (tpop.since == null || tpop.since > year) continue
    const popId = tpop.parent_id ?? ''
    knownTpopsByPop.set(popId, (knownTpopsByPop.get(popId) ?? 0) + 1)
  }
  let pop100 = 0
  let pop200 = 0
  for (const pop of rows) {
    if (pop.level !== 1) continue
    if (pop.since == null || pop.since > year) continue
    const code = statusCode(pop.status)
    if (code !== 100 && code !== 200) continue
    if ((knownTpopsByPop.get(pop.place_id) ?? 0) === 0) continue
    if (code === 100) pop100++
    else pop200++
  }
  return { pop100, pop200, total: pop100 + pop200 }
}

/**
 * apf2 jber_abc (erfolg CTE): whether the art has at least one as-of-year
 * non-potential population (status < 300, bekannt_seit <= year) with a
 * non-potential, report-relevant, by-then-known tpop.
 */
export const hasQualifyingPopulation = (
  rows: PlaceRow[],
  year: number,
): boolean => {
  const popById = new Map(
    rows
      .filter(
        (row) =>
          row.level === 1 &&
          row.since != null &&
          row.since <= year &&
          (statusCode(row.status) ?? 0) < 300,
      )
      .map((row) => [row.place_id, row]),
  )
  return rows.some(
    (tpop) =>
      tpop.level === 2 &&
      tpop.relevant &&
      tpop.since != null &&
      tpop.since <= year &&
      (statusCode(tpop.status) ?? 0) < 300 &&
      popById.has(tpop.parent_id ?? ''),
  )
}

// ---------------------------------------------------------------------------
// components

const ArtVerantwortlicheBlock = ({ title }: { title?: string }) => {
  const { projectId } = useProjectReportContext()
  const arts = useArts(projectId)
  if (!projectId) return <NoContext label="Artverantwortliche" />

  // apf2 AvList: one row per art, grouped under the responsible person's
  // name (arts without one under '(kein Wert)'), both alphabetically
  const byAv = new Map<string, string[]>()
  for (const art of arts) {
    const av = art.bearbeiter?.trim() || '(kein Wert)'
    const list = byAv.get(av) ?? []
    list.push(art.name ?? '(keine Art gewählt)')
    byAv.set(av, list)
  }

  return (
    <div className={styles.shell}>
      {title && <div className={styles.title}>{title}</div>}
      <table className={styles.table}>
        <tbody>
          {[...byAv.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([av, artNames]) =>
              [...artNames]
                .sort((a, b) => a.localeCompare(b))
                .map((artName, index) => (
                  <tr key={`${av}-${artName}`}>
                    <td className={styles.avName}>{index === 0 ? av : ''}</td>
                    <td>{artName}</td>
                  </tr>
                )),
            )}
        </tbody>
      </table>
    </div>
  )
}

/** the X column for an erfolg sort value — index into the header order */
const ERFOLG_COLUMNS = [
  { sort: 5, label: 'nicht', className: 'nicht' },
  { sort: 4, label: 'wenig', className: 'wenig' },
  { sort: 3, label: 'mässig', className: 'maessig' },
  { sort: 2, label: 'gut', className: 'gut' },
  { sort: 1, label: 'sehr', className: 'sehr' },
] as const

const ErfolgBlock = ({ title }: { title?: string }) => {
  const { projectId, year } = useProjectReportContext()
  const arts = useArts(projectId)
  const reports = useYearReports(projectId, year)
  const { rowsByArtByYear, loading } = usePlaceRowsByArt(
    projectId,
    arts,
    year != null ? [year] : [],
  )
  const rowsByArt = rowsByArtByYear.get(year ?? -1) ?? new Map()
  const actionsRes = useLiveQuery(
    `SELECT DISTINCT p.parent_id AS pop_id
     FROM actions a
       INNER JOIN places p ON a.place_id = p.place_id
       INNER JOIN subprojects s ON p.subproject_id = s.subproject_id
     WHERE s.project_id = $1
       AND a.data ->> 'typ' IS NOT NULL
       AND extract(year from a.date)::int = $2`,
    [projectId ?? null, year ?? null],
  )
  if (!projectId) return <NoContext label="Erfolg" />
  if (year == null) return <NoContext label="Erfolg" />
  if (loading) return <Loading />

  const reportByArtYear = new Map(
    reports.map((report) => [
      `${report.subproject_id}|${report.year}`,
      report.beurteilung,
    ]),
  )
  const popsWithMassnahme = new Set(
    ((actionsRes?.rows ?? []) as unknown as { pop_id: string | null }[])
      .map((row) => row.pop_id)
      .filter((popId): popId is string => popId != null),
  )

  return (
    <div className={styles.shell}>
      <div className={styles.title}>
        {title ?? 'Erfolg'} {year}
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th rowSpan={2} className={styles.artHeader}>
              Art
            </th>
            <th colSpan={7} className={styles.erfolgHeader}>
              Erfolg
            </th>
            <th rowSpan={2} className={styles.verticalHeader}>
              nicht beurteilt
            </th>
            <th rowSpan={2} className={styles.verticalHeader}>
              keine Massnahme im Berichtsjahr
            </th>
            <th rowSpan={2} className={styles.verticalHeader}>
              Aktionsplan erstellt
            </th>
          </tr>
          <tr>
            {ERFOLG_COLUMNS.map((column) => (
              <th key={column.label} className={styles[column.className]}>
                {column.label}
              </th>
            ))}
            <th className={styles.veraenderung}>Verän- derung</th>
            <th className={styles.unsicher}>unsicher</th>
          </tr>
        </thead>
        <tbody>
          {arts.map((art, index) => {
            // the erfog only counts when the art has a qualifying
            // population as of the year (jber_abc's inner joins)
            const qualifies =
              rowsByArt.get(art.subproject_id) != null &&
              hasQualifyingPopulation(rowsByArt.get(art.subproject_id)!, year)
            const erfolg = qualifies
              ? erfolgSortOf(
                  reportByArtYear.get(`${art.subproject_id}|${year}`),
                )
              : null
            const erfolgVorjahr = erfolgSortOf(
              reportByArtYear.get(`${art.subproject_id}|${year - 1}`),
            )
            const rows = rowsByArt.get(art.subproject_id) ?? []
            // jber_abc c1LPop: qualifying as-of populations with a massnahme
            const artPopsWithMassnahme = rows.some(
              (pop: PlaceRow) =>
                pop.level === 1 &&
                pop.since != null &&
                pop.since <= year &&
                (statusCode(pop.status) ?? 0) < 300 &&
                popsWithMassnahme.has(pop.place_id),
            )
            return (
              <tr
                key={art.subproject_id}
                className={index % 2 === 1 ? styles.zebra : undefined}
              >
                <td>{art.name}</td>
                {ERFOLG_COLUMNS.map((column) => (
                  <td key={column.label} className={styles[column.className]}>
                    {erfolg === column.sort ? 'X' : ''}
                  </td>
                ))}
                <td className={styles.veraenderung}>
                  {veränderung(erfolg, erfolgVorjahr)}
                </td>
                <td className={styles.unsicher}>{erfolg === 6 ? 'X' : ''}</td>
                <td>{erfolg == null ? 'X' : ''}</td>
                <td>{!artPopsWithMassnahme ? 'X' : ''}</td>
                <td>{art.bearbeitung === 'erstellt' ? 'X' : ''}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const AktuellePopulationenBlock = ({ title }: { title?: string }) => {
  const { projectId, year } = useProjectReportContext()
  const arts = useArts(projectId)
  // hooks before the early returns; an empty year list skips the queries
  const { rowsByArtByYear, loading } = usePlaceRowsByArt(
    projectId,
    arts,
    year != null ? [year, year - 1] : [],
  )
  if (!projectId) return <NoContext label="Übersicht Populationen" />
  if (year == null) return <NoContext label="Übersicht Populationen" />
  if (loading) return <Loading />

  const counts = arts.map((art) => {
    const rows = rowsByArtByYear.get(year)?.get(art.subproject_id) ?? []
    const previousRows =
      rowsByArtByYear.get(year - 1)?.get(art.subproject_id) ?? []
    const current = popCountsAsOfYear(rows, year)
    const previous = popCountsAsOfYear(previousRows, year - 1)
    return {
      art,
      current,
      diffs: {
        pop100: current.pop100 - previous.pop100,
        pop200: current.pop200 - previous.pop200,
        total: current.total - previous.total,
      },
    }
  })

  const diffClass = (diff: number) =>
    diff > 0 ? styles.positive : diff < 0 ? styles.negative : undefined

  return (
    <div className={styles.shell}>
      {title && <div className={styles.title}>{title}</div>}
      <table className={styles.table}>
        <thead>
          <tr>
            <th rowSpan={2}>Aktionsplan</th>
            <th colSpan={3} className={styles.groupHeader}>
              aktuelle Werte
            </th>
            <th colSpan={3} className={styles.groupHeader}>
              Differenz zum Vorjahr
            </th>
          </tr>
          <tr>
            <th className={styles.number}>ursprünglich</th>
            <th className={styles.number}>angesiedelt</th>
            <th className={styles.number}>total</th>
            <th className={styles.number}>ursprünglich</th>
            <th className={styles.number}>angesiedelt</th>
            <th className={styles.number}>total</th>
          </tr>
        </thead>
        <tbody>
          {counts.map(({ art, current, diffs }, index) => (
            <tr
              key={art.subproject_id}
              className={index % 2 === 1 ? styles.zebra : undefined}
            >
              <td>{art.name}</td>
              <td className={styles.number}>{current.pop100}</td>
              <td className={styles.number}>{current.pop200}</td>
              <td className={styles.number}>{current.total}</td>
              <td
                className={`${styles.number} ${diffClass(diffs.pop100) ?? ''}`}
              >
                {diffs.pop100}
              </td>
              <td
                className={`${styles.number} ${diffClass(diffs.pop200) ?? ''}`}
              >
                {diffs.pop200}
              </td>
              <td
                className={`${styles.number} ${diffClass(diffs.total) ?? ''}`}
              >
                {diffs.total}
              </td>
            </tr>
          ))}
          <tr className={styles.totalsRow}>
            <td>{arts.length}</td>
            <td className={styles.number}>
              {counts.reduce((sum, row) => sum + row.current.pop100, 0)}
            </td>
            <td className={styles.number}>
              {counts.reduce((sum, row) => sum + row.current.pop200, 0)}
            </td>
            <td className={styles.number}>
              {counts.reduce((sum, row) => sum + row.current.total, 0)}
            </td>
            <td className={styles.number}>
              {counts.reduce((sum, row) => sum + row.diffs.pop100, 0)}
            </td>
            <td className={styles.number}>
              {counts.reduce((sum, row) => sum + row.diffs.pop200, 0)}
            </td>
            <td className={styles.number}>
              {counts.reduce((sum, row) => sum + row.diffs.total, 0)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

/** the Puck component registry for the design editor and the print view */
export const buildProjectDataComponents = (): Config['components'] => ({
  ArtVerantwortliche: {
    label: 'Artverantwortliche',
    fields: { title: { type: 'text' } },
    defaultProps: { title: 'Artverantwortliche' },
    render: ({ title }) => <ArtVerantwortlicheBlock title={title} />,
  },
  Erfolg: {
    label: 'Erfolg',
    fields: { title: { type: 'text' } },
    defaultProps: { title: 'Erfolg' },
    render: ({ title }) => <ErfolgBlock title={title} />,
  },
  AktuellePopulationen: {
    label: 'Übersicht aktuelle Populationen',
    fields: { title: { type: 'text' } },
    defaultProps: {
      title: 'Übersicht über aktuelle Populationen aller AP-Arten',
    },
    render: ({ title }) => <AktuellePopulationenBlock title={title} />,
  },
})
