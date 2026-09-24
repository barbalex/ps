import { createContext, useContext } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import type { Config } from '@puckeditor/core'

import {
  asOfYear,
  statusCode,
  useReportVersions,
} from '../../components/shared/reportVersions.ts'
import styles from './reportComponents.module.css'

/**
 * Data-driven building blocks for subproject report designs: everything the
 * apf2 yearly report contains beyond free-text fields and charts.
 * The components query the local database themselves (live queries), scoped
 * by the report context — the art (subproject) and year being reported.
 * They are used both in the design editor (preview) and the report print.
 */

/**
 * Read-only report field that wraps its (possibly long) text — unlike an
 * input, which clips to one line. Used for report fields in print and
 * design preview.
 */
export const WrappingTextField = ({
  label,
  value,
}: {
  label?: string
  value?: string
}) => (
  <div className={styles.wrappingField}>
    <div className={styles.wrappingFieldLabel}>{label}</div>
    <div className={styles.wrappingFieldValue}>{value}</div>
  </div>
)

export type SubprojectReportContextValue = {
  projectId?: string
  subprojectId?: string
  year?: number | null
}

export const SubprojectReportContext =
  createContext<SubprojectReportContextValue>({})

export const useSubprojectReportContext = () =>
  useContext(SubprojectReportContext)

type Counts = { pop: number; tpop: number }

/** box the report tables live in — kept together when printing */
const TableShell = ({
  title,
  children,
}: {
  title?: string
  children: React.ReactNode
}) => (
  <div className={styles.shell}>
    {title && <div className={styles.title}>{title}</div>}
    {children}
  </div>
)

const NoContext = ({ label }: { label: string }) => (
  <div className={styles.noContext}>
    {label}: kein Teilprojekt-Kontext
  </div>
)

// ---------------------------------------------------------------------------

const Heading = ({ text }: { text?: string }) => (
  <h2 className={styles.heading}>{text}</h2>
)

const TitleBlock = ({ author, showDate }: { author?: string; showDate?: boolean }) => {
  const { subprojectId, year } = useSubprojectReportContext()
  // a null subprojectId matches no row — avoids conditional queries
  const res = useLiveQuery(
    `SELECT
      (SELECT name FROM projects WHERE project_id = s.project_id) AS project_name,
      s.name AS subproject_name
    FROM subprojects s WHERE s.subproject_id = $1`,
    [subprojectId ?? null],
  )
  const row = res?.rows?.[0] as
    | { project_name: string | null; subproject_name: string | null }
    | undefined
  if (!subprojectId) return <NoContext label="Titel" />

  return (
    <div className={styles.titleBlock}>
      <h1 className={styles.titleMain}>
        Jahresbericht {year ?? ''} — {row?.subproject_name ?? ''}
      </h1>
      {(row?.project_name || author || showDate) && (
        <div className={styles.titleMeta}>
          {row?.project_name}
          {author ? ` — ${author}` : ''}
          {showDate ?
            ` — ${new Date().toLocaleDateString('de-CH')}`
          : ''}
        </div>
      )}
    </div>
  )
}



type PlaceRow = {
  place_id: string
  parent_id: string | null
  level: number | null
  since: number | null
  status: string | null
  relevant: boolean
}

/**
 * All places of the art with the fields the report tables classify by.
 * For a report year, the rows are read from the server-side historization
 * (as of the end of that year); offline (or without a year) the current
 * local state is used.
 * Mirrors apf2's jber_abc: known-since (bekannt_seit) must be within the
 * report year, tpops must be relevant for reports (apber_relevant), and a
 * population only counts if it has at least one relevant tpop.
 */
const usePlaceRows = (
  subprojectId: string | undefined,
  year: number | null | undefined,
) => {
  const live = useLiveQuery(
    `SELECT place_id, parent_id, level, since, data ->> 'status' AS status,
       COALESCE(relevant_for_reports, TRUE) AS relevant
     FROM places
     WHERE subproject_id = $1`,
    [subprojectId ?? null],
  )
  const { data: versions } = useReportVersions(subprojectId)

  if (year != null && versions) {
    return asOfYear(versions.places, year, 'place_id').map((place) => {
      const data = place.data as Record<string, unknown> | null
      return {
        place_id: place.place_id as string,
        parent_id: (place.parent_id as string | null) ?? null,
        level: (place.level as number | null) ?? null,
        since: (place.since as number | null) ?? null,
        status: ((data?.status as string | null) ?? null),
        relevant: place.relevant_for_reports == null
          ? true
          : !!place.relevant_for_reports,
      }
    })
  }
  return (live?.rows ?? []) as unknown as PlaceRow[]
}

const useStartYear = (
  subprojectId: string | undefined,
  year: number | null | undefined,
) => {
  const live = useLiveQuery(
    `SELECT start_year FROM subprojects WHERE subproject_id = $1`,
    [subprojectId ?? null],
  )
  const { data: versions } = useReportVersions(subprojectId)

  if (year != null && versions) {
    const subproject = asOfYear(versions.subprojects, year, 'subproject_id')[0]
    return (subproject?.start_year as number | null) ?? null
  }
  return (live?.rows?.[0] as { start_year: number | null } | undefined)
    ?.start_year ?? null
}

/** apf2 tpopmassn_erfbeurt_werte: beurteilung text -> code */
const beurteilungCode = (text: string | null | undefined): number | null => {
  switch (text) {
    case 'sehr erfolgreich':
      return 1
    case 'erfolgreich':
      return 2
    case 'weniger erfolgreich':
      return 3
    case 'nicht erfolgreich':
      return 4
    case 'unsicher':
      return 5
    default:
      return null
  }
}

const useCheckReports = (subprojectId: string | undefined) => {
  const res = useLiveQuery(
    `SELECT r.place_id, r.year, r.data ->> 'entwicklung' AS entwicklung
     FROM check_reports r
       INNER JOIN places p ON r.place_id = p.place_id
     WHERE p.subproject_id = $1`,
    [subprojectId ?? null],
  )
  return (res?.rows ?? []) as unknown as {
    place_id: string
    year: number | null
    entwicklung: string | null
  }[]
}

const useActionReports = (subprojectId: string | undefined) => {
  const res = useLiveQuery(
    `SELECT r.place_id, r.year, r.data ->> 'beurteilung' AS beurteilung
     FROM action_reports r
       INNER JOIN places p ON r.place_id = p.place_id
     WHERE p.subproject_id = $1`,
    [subprojectId ?? null],
  )
  return (res?.rows ?? []) as unknown as {
    place_id: string
    year: number | null
    beurteilung: string | null
  }[]
}

const useReportActions = (subprojectId: string | undefined) => {
  const res = useLiveQuery(
    `SELECT a.place_id, extract(year from a.date)::int AS year
     FROM actions a
       INNER JOIN places p ON a.place_id = p.place_id
     WHERE p.subproject_id = $1 AND a.data ->> 'typ' IS NOT NULL`,
    [subprojectId ?? null],
  )
  return (res?.rows ?? []) as unknown as { place_id: string; year: number }[]
}

/**
 * The place sets the report tables count on, mirroring apf2's jber_abc SQL:
 * places without bekannt_seit never count (NULL comparisons are false there),
 * tpops must be report-relevant, and tpop counts sit under non-potential pops.
 */
const reportPlaceSets = (rows: PlaceRow[], jahr: number) => {
  const popRows = rows.filter(
    (r) => r.level === 1 && r.since != null && r.since <= jahr,
  )
  const popById = new Map(popRows.map((p) => [p.place_id, p]))
  const relevantTpops = rows.filter(
    (r) => r.level === 2 && r.relevant && r.since != null && r.since <= jahr,
  )
  const tpopsByPopId = new Map<string, PlaceRow[]>()
  for (const tpop of relevantTpops) {
    const list = tpopsByPopId.get(tpop.parent_id ?? '') ?? []
    list.push(tpop)
    tpopsByPopId.set(tpop.parent_id ?? '', list)
  }
  const nonPotential = (place: PlaceRow | undefined) =>
    place != null && (statusCode(place.status) ?? 0) < 300
  const tpopRows = relevantTpops.filter((t) =>
    nonPotential(popById.get(t.parent_id ?? '')),
  )
  const tpopRowsBoth = tpopRows.filter(
    (t) => (statusCode(t.status) ?? 0) < 300,
  )
  // pops with at least one report-relevant tpop (the join of the pop counts)
  const joinedPops = popRows.filter(
    (p) => (tpopsByPopId.get(p.place_id) ?? []).length > 0,
  )
  return {
    popRows,
    popById,
    relevantTpops,
    tpopsByPopId,
    tpopRows,
    tpopRowsBoth,
    joinedPops,
  }
}

const GrundmengenTable = ({ title }: { title?: string }) => {
  const { subprojectId, year } = useSubprojectReportContext()
  const rows = usePlaceRows(subprojectId, year)
  const startYear = useStartYear(subprojectId, year)
  if (!subprojectId) return <NoContext label={title ?? 'Grundmengen'} />

  const jahr = year ?? new Date().getFullYear()
  const { popRows, popById, relevantTpops, tpopsByPopId } = reportPlaceSets(
    rows,
    jahr,
  )
  const start = startYear ?? 0
  const nonPotential = (place: PlaceRow | undefined) =>
    place != null && (statusCode(place.status) ?? 0) < 300

  // pop counts need a report-relevant tpop; for the angesiedelt split, apf2
  // requires that tpop to be known on the same side of the AP start year
  const popCount = (
    pred: (place: PlaceRow) => boolean,
    tpopPred: (tpop: PlaceRow) => boolean = () => true,
  ) =>
    popRows.filter(
      (p) =>
        pred(p) && (tpopsByPopId.get(p.place_id) ?? []).some(tpopPred),
    ).length

  const tpopCount = (
    pred: (tpop: PlaceRow) => boolean,
    popOk: (place: PlaceRow | undefined) => boolean = nonPotential,
  ) =>
    relevantTpops.filter((t) => {
      const pop = popById.get(t.parent_id ?? '')
      return popOk(pop) && pred(t)
    }).length

  // a3: aktuell, davon ursprünglich
  const a3Pop = popCount((p) => statusCode(p.status) === 100)
  const a3Tpop = tpopCount((t) => statusCode(t.status) === 100)
  // a4: angesiedelt vor Beginn AP
  const a4Pop = popCount(
    (p) => statusCode(p.status) === 200 && (p.since ?? 0) < start,
    (t) => (t.since ?? 0) < start,
  )
  const a4Tpop = tpopCount(
    (t) => statusCode(t.status) === 200 && (t.since ?? 0) < start,
  )
  // a5: angesiedelt nach Beginn AP
  const a5Pop = popCount(
    (p) => statusCode(p.status) === 200 && (p.since ?? Infinity) >= start,
    (t) => (t.since ?? Infinity) >= start,
  )
  const a5Tpop = tpopCount(
    (t) => statusCode(t.status) === 200 && (t.since ?? Infinity) >= start,
  )
  // a7: erloschen, zuvor autochthon oder vor AP angesiedelt
  const a7Pop = popCount(
    (p) =>
      statusCode(p.status) === 101 ||
      (statusCode(p.status) === 202 && (p.since ?? 0) < start),
  )
  const a7Tpop = tpopCount(
    (t) =>
      statusCode(t.status) === 101 ||
      (statusCode(t.status) === 202 && (t.since ?? 0) < start),
  )
  // a8: erloschen, nach Beginn AP angesiedelt
  const a8Pop = popCount(
    (p) => statusCode(p.status) === 202 && (p.since ?? Infinity) >= start,
  )
  const a8Tpop = tpopCount(
    (t) => statusCode(t.status) === 202 && (t.since ?? Infinity) >= start,
  )
  // a9: Ansaatversuche (apf2 counts these tpops under any known pop)
  const a9Pop = popCount((p) => statusCode(p.status) === 201)
  const a9Tpop = tpopCount(
    (t) => statusCode(t.status) === 201,
    (p) => p != null,
  )

  const a1 = { pop: a3Pop + a4Pop + a5Pop + a7Pop + a8Pop + a9Pop, tpop: a3Tpop + a4Tpop + a5Tpop + a7Tpop + a8Tpop + a9Tpop }
  const a2 = { pop: a3Pop + a4Pop + a5Pop, tpop: a3Tpop + a4Tpop + a5Tpop }
  const a6 = { pop: a7Pop + a8Pop, tpop: a7Tpop + a8Tpop }

  const tableRows: { label: string; counts: Counts; indent?: number; bold?: boolean }[] = [
    { label: 'Anzahl bekannt', counts: a1 },
    { label: 'aktuell', counts: a2, indent: 1, bold: true },
    { label: 'davon: ursprünglich', counts: { pop: a3Pop, tpop: a3Tpop }, indent: 2 },
    { label: 'angesiedelt (vor Beginn AP)', counts: { pop: a4Pop, tpop: a4Tpop }, indent: 2 },
    { label: 'angesiedelt (nach Beginn AP)', counts: { pop: a5Pop, tpop: a5Tpop }, indent: 2 },
    { label: 'erloschen (nach 1950):', counts: a6, indent: 1, bold: true },
    { label: 'davon: zuvor autochthon oder vor AP angesiedelt', counts: { pop: a7Pop, tpop: a7Tpop }, indent: 2 },
    { label: 'nach Beginn Aktionsplan angesiedelt', counts: { pop: a8Pop, tpop: a8Tpop }, indent: 2 },
    { label: 'Ansaatversuche:', counts: { pop: a9Pop, tpop: a9Tpop } },
  ]

  return (
    <TableShell title={title}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{jahr}</th>
            <th>Pop</th>
            <th>TPop</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, i) => (
            <tr key={`${i}-${row.label}`}>
              <td
                style={{
                  paddingLeft: `calc(6px + ${(row.indent ?? 0) * 16}px)`,
                  fontWeight: row.bold ? 600 : undefined,
                }}
              >
                {row.label}
              </td>
              <td className={styles.number}>{row.counts.pop}</td>
              <td className={styles.number}>{row.counts.tpop}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  )
}

const DevelopmentTable = ({
  title,
  sinceYear: sinceYearProp,
}: {
  title?: string
  sinceYear?: number | null
}) => {
  const { subprojectId, year } = useSubprojectReportContext()
  const rows = usePlaceRows(subprojectId, year)
  const berichte = useCheckReports(subprojectId)
  if (!subprojectId) return <NoContext label={title ?? 'Bestandesentwicklung'} />

  const jahr = year ?? new Date().getFullYear()
  const { joinedPops, tpopRowsBoth } = reportPlaceSets(rows, jahr)

  // apf2 counts popber rows for the year column and, for the "seit" column,
  // places with any entwicklung-bearing bericht
  const popIds = new Set(
    joinedPops
      .filter((p) => (statusCode(p.status) ?? 0) < 300)
      .map((p) => p.place_id),
  )
  const tpopIds = new Set(tpopRowsBoth.map((t) => t.place_id))
  const popBers = berichte.filter((b) => popIds.has(b.place_id))
  const tpopBers = berichte.filter((b) => tpopIds.has(b.place_id))

  const inYear = {
    pop: popBers.filter((b) => b.year === jahr).length,
    tpop: tpopBers.filter((b) => b.year === jahr).length,
  }
  const withEntwicklung = (list: typeof berichte) =>
    list.filter((b) => b.year != null && b.year <= jahr && b.entwicklung != null)
  const since = {
    pop: new Set(withEntwicklung(popBers).map((b) => b.place_id)).size,
    tpop: new Set(withEntwicklung(tpopBers).map((b) => b.place_id)).size,
  }
  const firstTpopberYear = withEntwicklung(tpopBers).reduce(
    (min, b) => Math.min(min, b.year ?? min),
    Infinity,
  )
  const sinceLabel =
    sinceYearProp ?? (Number.isFinite(firstTpopberYear) ? firstTpopberYear : '…')

  return (
    <TableShell title={title}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{''}</th>
            <th>Pop {jahr}</th>
            <th>TPop {jahr}</th>
            <th>Pop seit {sinceLabel}</th>
            <th>TPop seit {sinceLabel}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>kontrolliert (inkl. Ansaatversuche)</td>
            <td className={styles.number}>{inYear.pop}</td>
            <td className={styles.number}>{inYear.tpop}</td>
            <td className={styles.number}>{since.pop}</td>
            <td className={styles.number}>{since.tpop}</td>
          </tr>
        </tbody>
      </table>
    </TableShell>
  )
}

const ActionsSummaryTable = ({
  title,
  sinceYear: sinceYearProp,
}: {
  title?: string
  sinceYear?: number | null
}) => {
  const { subprojectId, year } = useSubprojectReportContext()
  const rows = usePlaceRows(subprojectId, year)
  const actions = useReportActions(subprojectId)
  const actionReports = useActionReports(subprojectId)
  if (!subprojectId) return <NoContext label={title ?? 'Zwischenbilanz'} />

  const jahr = year ?? new Date().getFullYear()
  const { joinedPops, tpopRowsBoth } = reportPlaceSets(rows, jahr)

  const popIds = new Set(
    joinedPops
      .filter((p) => (statusCode(p.status) ?? 0) < 300)
      .map((p) => p.place_id),
  )
  const tpopIds = new Set(tpopRowsBoth.map((t) => t.place_id))
  // apf2 counts actions (and pops via them) on tpop level
  const tpopActions = actions.filter((a) => tpopIds.has(a.place_id))
  const popOfTpop = new Map(
    tpopRowsBoth.map((t) => [t.place_id, t.parent_id ?? '']),
  )
  const tpopActionYears = tpopActions.filter((a) => a.year <= jahr)
  const inYearTpop = tpopActionYears.filter((a) => a.year === jahr)
  const inYear = {
    pop: new Set(inYearTpop.map((a) => popOfTpop.get(a.place_id))).size,
    tpop: new Set(inYearTpop.map((a) => a.place_id)).size,
  }
  const since = {
    pop: new Set(tpopActionYears.map((a) => popOfTpop.get(a.place_id))).size,
    tpop: new Set(tpopActionYears.map((a) => a.place_id)).size,
  }
  const firstActionYear = tpopActions
    .filter((a) => a.year <= jahr)
    .reduce((min, a) => Math.min(min, a.year), Infinity)
  const sinceLabel =
    sinceYearProp ?? (Number.isFinite(firstActionYear) ? firstActionYear : '…')

  // latest beurteilung per place (apf2: DISTINCT ON ... ORDER BY jahr DESC)
  const latestByPlace = (
    list: { place_id: string; year: number | null; beurteilung: string | null }[],
  ) => {
    const latest = new Map<string, { year: number; code: number }>()
    for (const ber of list) {
      const code = beurteilungCode(ber.beurteilung)
      if (ber.year == null || code == null || code < 1 || code > 5) continue
      if (ber.year > jahr) continue
      const current = latest.get(ber.place_id)
      if (!current || ber.year >= current.year) {
        latest.set(ber.place_id, { year: ber.year, code })
      }
    }
    return latest
  }
  const latestPop = latestByPlace(actionReports.filter((b) => popIds.has(b.place_id)))
  const latestTpop = latestByPlace(actionReports.filter((b) => tpopIds.has(b.place_id)))
  const byCode = (code: number) => ({
    pop: [...latestPop.values()].filter((b) => b.code === code).length,
    tpop: [...latestTpop.values()].filter((b) => b.code === code).length,
  })

  const tableRows: {
    label: string
    year?: Counts
    range?: Counts
    indent?: number
  }[] = [
    {
      label: 'Anzahl Populationen/Teilpopulationen mit Massnahmen',
      year: inYear,
      range: since,
    },
    { label: 'kontrolliert', range: { pop: latestPop.size, tpop: latestTpop.size }, indent: 1 },
    { label: 'davon: sehr erfolgreich', range: byCode(1), indent: 2 },
    { label: 'erfolgreich', range: byCode(2), indent: 2 },
    { label: 'weniger erfolgreich', range: byCode(3), indent: 2 },
    { label: 'nicht erfolgreich', range: byCode(4), indent: 2 },
    { label: 'mit unsicherer Wirkung', range: byCode(5), indent: 2 },
  ]

  return (
    <TableShell title={title}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{''}</th>
            <th>Pop {jahr}</th>
            <th>TPop {jahr}</th>
            <th>Pop seit {sinceLabel}</th>
            <th>TPop seit {sinceLabel}</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, i) => (
            <tr key={`${i}-${row.label}`}>
              <td
                style={{ paddingLeft: `calc(6px + ${(row.indent ?? 0) * 16}px)` }}
              >
                {row.label}
              </td>
              <td className={styles.number}>{row.year?.pop ?? ''}</td>
              <td className={styles.number}>{row.year?.tpop ?? ''}</td>
              <td className={styles.number}>{row.range?.pop ?? ''}</td>
              <td className={styles.number}>{row.range?.tpop ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  )
}

const GoalsTable = ({ title }: { title?: string }) => {
  const { subprojectId, year } = useSubprojectReportContext()
  const reportYear = year ?? new Date().getFullYear()
  const res = useLiveQuery(
    `SELECT name, data
     FROM goals
     WHERE subproject_id = $1 AND year = $2
     ORDER BY name`,
    [subprojectId ?? null, reportYear],
  )
  if (!subprojectId) return <NoContext label={title ?? 'Ziele'} />

  const rows = (res?.rows ?? []) as {
    name: string | null
    data: Record<string, unknown> | null
  }[]

  return (
    <TableShell title={title}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Typ</th>
            <th>Ziel</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={2}>Keine Ziele für {reportYear}</td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr key={i}>
              <td className={styles.nowrap}>
                {(row.data?.typ as string) ?? 'Zwischenziel'}
              </td>
              <td>
                {row.name}
                {row.data?.beurteilung ?
                  <div className={styles.assessment}>
                    Beurteilung: {row.data.beurteilung as string}
                  </div>
                : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  )
}

// ---------------------------------------------------------------------------

const MassnahmenList = ({ title }: { title?: string }) => {
  const { subprojectId, year } = useSubprojectReportContext()
  const reportYear = year ?? new Date().getFullYear()
  const res = useLiveQuery(
    `SELECT
       COALESCE(NULLIF(pp.label, ''), pp.name) AS pop_label,
       COALESCE(NULLIF(p.label, ''), p.name) AS tpop_label,
       to_char(a.date, 'DD.MM.YYYY') AS date,
       a.data ->> 'typ' AS typ,
       a.data ->> 'beschreibung' AS beschreibung
     FROM actions a
       INNER JOIN places p ON a.place_id = p.place_id
       LEFT JOIN places pp ON pp.place_id = p.parent_id
     WHERE p.subproject_id = $1 AND extract(year from a.date) = $2
     ORDER BY pop_label, tpop_label, a.date`,
    [subprojectId ?? null, reportYear],
  )

  const rows = (res?.rows ?? []) as {
    pop_label: string | null
    tpop_label: string | null
    date: string | null
    typ: string | null
    beschreibung: string | null
  }[]

  // like apf2: the section is omitted when there are no actions in the year
  if (!rows.length) return null

  return (
    <TableShell title={title}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Population</th>
            <th>Teil-Population</th>
            <th>Datum</th>
            <th>Typ</th>
            <th>Massnahme</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className={styles.nowrap}>{row.pop_label}</td>
              <td>{row.tpop_label}</td>
              <td className={styles.nowrap}>{row.date}</td>
              <td>{row.typ}</td>
              <td>{row.beschreibung}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  )
}

// ---------------------------------------------------------------------------

/**
 * The data-driven report components for Puck configs, shared between the
 * design editor and the report print.
 */
export const buildDataComponents = (): Config['components'] => ({
  Heading: {
    label: 'Überschrift',
    fields: {
      text: { type: 'text' },
    },
    defaultProps: { text: 'Überschrift' },
    render: ({ text }) => <Heading text={text} />,
  },
  TitleBlock: {
    label: 'Titel (Art, Jahr, Autor)',
    fields: {
      author: { type: 'text' },
      showDate: { type: 'checkbox' },
    },
    defaultProps: { author: '', showDate: true },
    render: ({ author, showDate }) => (
      <TitleBlock author={author} showDate={showDate} />
    ),
  },
  GrundmengenTable: {
    label: 'Tabelle: Grundmengen',
    fields: {
      title: { type: 'text' },
    },
    defaultProps: { title: 'A. Grundmengen' },
    render: ({ title }) => <GrundmengenTable title={title} />,
  },
  DevelopmentTable: {
    label: 'Tabelle: Bestandesentwicklung',
    fields: {
      title: { type: 'text' },
      sinceYear: { type: 'number' },
    },
    defaultProps: { title: 'B. Bestandesentwicklung', sinceYear: null },
    render: ({ title, sinceYear }) => (
      <DevelopmentTable title={title} sinceYear={sinceYear} />
    ),
  },
  ActionsSummaryTable: {
    label: 'Tabelle: Zwischenbilanz Massnahmen',
    fields: {
      title: { type: 'text' },
      sinceYear: { type: 'number' },
    },
    defaultProps: { title: 'C. Zwischenbilanz zur Wirkung von Massnahmen', sinceYear: null },
    render: ({ title, sinceYear }) => (
      <ActionsSummaryTable title={title} sinceYear={sinceYear} />
    ),
  },
  GoalsTable: {
    label: 'Tabelle: Ziele',
    fields: {
      title: { type: 'text' },
    },
    defaultProps: { title: 'Ziele im Berichtsjahr' },
    render: ({ title }) => <GoalsTable title={title} />,
  },
  MassnahmenList: {
    label: 'Liste: Massnahmen im Berichtsjahr',
    fields: {
      title: { type: 'text' },
    },
    defaultProps: { title: 'Massnahmen im Berichtsjahr:' },
    render: ({ title }) => <MassnahmenList title={title} />,
  },
})
