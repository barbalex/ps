import { createContext, useContext } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import type { Config } from '@puckeditor/core'

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

// apflora status codes, derived from the status text:
// 100 ursprünglich aktuell, 101 ursprünglich erloschen,
// 200 angesiedelt aktuell, 201 Ansaatversuch,
// 202 angesiedelt erloschen, 300 potentieller Wuchs-/Ansiedlungsort
const statusCode = (status: string | null | undefined): number | null => {
  const s = (status ?? '').toLowerCase()
  if (s.startsWith('potentieller')) return 300
  if (s.includes('ansaatversuch')) return 201
  const urspruenglich = s.startsWith('ursprünglich')
  const erloschen = s.includes('erloschen')
  const aktuell = s.includes('aktuell')
  if (urspruenglich && aktuell) return 100
  if (urspruenglich && erloschen) return 101
  if (aktuell) return 200
  if (erloschen) return 202
  return null
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
 * Mirrors apf2's jber_abc: known-since (bekannt_seit) must be within the
 * report year, tpops must be relevant for reports (apber_relevant), and a
 * population only counts if it has at least one relevant tpop.
 */
const usePlaceRows = (subprojectId?: string) => {
  const res = useLiveQuery(
    `SELECT place_id, parent_id, level, since, data ->> 'status' AS status,
       COALESCE(relevant_for_reports, TRUE) AS relevant
     FROM places
     WHERE subproject_id = $1`,
    [subprojectId ?? null],
  )
  return (res?.rows ?? []) as unknown as PlaceRow[]
}

const useStartYear = (subprojectId?: string) => {
  const res = useLiveQuery(
    `SELECT start_year FROM subprojects WHERE subproject_id = $1`,
    [subprojectId ?? null],
  )
  return (res?.rows?.[0] as { start_year: number | null } | undefined)
    ?.start_year ?? null
}

const GrundmengenTable = ({ title }: { title?: string }) => {
  const { subprojectId, year } = useSubprojectReportContext()
  const rows = usePlaceRows(subprojectId)
  const startYear = useStartYear(subprojectId)
  if (!subprojectId) return <NoContext label={title ?? 'Grundmengen'} />

  const jahr = year ?? new Date().getFullYear()

  // tpops relevant for the report and known in the report year
  const relevantTpops = rows.filter(
    (r) => r.level === 2 && r.relevant && (r.since ?? Infinity) <= jahr,
  )
  // populations with at least one relevant tpop, known in the report year
  const relevantPopIds = new Set(
    relevantTpops.map((r) => r.parent_id).filter(Boolean) as string[],
  )
  const knownPops = rows.filter(
    (r) =>
      r.level === 1 &&
      relevantPopIds.has(r.place_id) &&
      (r.since ?? Infinity) <= jahr,
  )
  // a place qualifies for pop counting per its own (pop) status,
  // for tpop counting per its own (tpop) status and its pop not being potential
  const popStatus = (code: number) =>
    knownPops.filter((r) => statusCode(r.status) === code)
  const tpopStatus = (code: number, extra?: (r: PlaceRow) => boolean) =>
    relevantTpops.filter((r) => {
      const pop = rows.find((p) => p.place_id === r.parent_id)
      return (
        statusCode(r.status) === code &&
        (pop ? (statusCode(pop.status) ?? 0) < 300 : true) &&
        (!extra || extra(r))
      )
    })

  const popByCode = (code: number) => popStatus(code).length
  const tpopByCode = (code: number, extra?: (r: PlaceRow) => boolean) =>
    tpopStatus(code, extra).length

  const beforeAp = (r: PlaceRow) =>
    startYear != null && (r.since ?? -Infinity) < startYear
  const sinceAp = (r: PlaceRow) =>
    startYear == null || (r.since ?? -Infinity) >= startYear

  // a3: aktuell, davon ursprünglich
  const a3Pop = popByCode(100)
  const a3Tpop = tpopByCode(100)
  // a4: angesiedelt vor Beginn AP
  const a4Pop = popStatus(200).filter(beforeAp).length
  const a4Tpop = tpopStatus(200, beforeAp).length
  // a5: angesiedelt nach Beginn AP
  const a5Pop = popStatus(200).filter(sinceAp).length
  const a5Tpop = tpopStatus(200, sinceAp).length
  // a7: erloschen, zuvor autochthon oder vor AP angesiedelt
  const a7Pop = [
    ...popStatus(101),
    ...popStatus(202).filter(beforeAp),
  ].length
  const a7Tpop = [
    ...tpopStatus(101),
    ...tpopStatus(202, beforeAp),
  ].length
  // a8: erloschen, nach Beginn AP angesiedelt
  const a8Pop = popStatus(202).filter(sinceAp).length
  const a8Tpop = tpopStatus(202, sinceAp).length
  // a9: Ansaatversuche
  const a9Pop = popByCode(201)
  const a9Tpop = tpopByCode(201)

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
                  paddingLeft: `${(row.indent ?? 0) * 16}px`,
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
  const places = usePlaceRows(subprojectId)
  const startYear = useStartYear(subprojectId)
  const res = useLiveQuery(
    `SELECT c.place_id, extract(year from c.date)::int AS year
     FROM checks c
       INNER JOIN places p ON c.place_id = p.place_id
     WHERE p.subproject_id = $1 AND c.data ->> 'entwicklung' IS NOT NULL`,
    [subprojectId ?? null],
  )
  if (!subprojectId) return <NoContext label={title ?? 'Bestandesentwicklung'} />

  const jahr = year ?? new Date().getFullYear()
  const rows = (res?.rows ?? []) as { place_id: string; year: number }[]

  // only relevant tpops known in the report year are counted; their
  // populations with at least one such tpop
  const relevantTpops = places.filter(
    (r) => r.level === 2 && r.relevant && (r.since ?? Infinity) <= jahr,
  )
  const relevantPopIds = new Set(
    relevantTpops.map((r) => r.parent_id).filter(Boolean) as string[],
  )
  const placeById = new Map(places.map((r) => [r.place_id, r]))

  const inYear = { pop: 0, tpop: 0 }
  const inRange = { pop: 0, tpop: 0 }
  const firstYear: number | null = rows.length
    ? Math.min(...rows.map((r) => r.year))
    : null
  const since = sinceYearProp ?? startYear
  const seenYearTpops = new Set<string>()
  const seenYearPops = new Set<string>()
  const seenRangeTpops = new Set<string>()
  const seenRangePops = new Set<string>()
  for (const row of rows) {
    const place = placeById.get(row.place_id)
    if (!place || !place.relevant) continue
    if ((place.since ?? Infinity) > jahr) continue
    const popId = place.parent_id
    if (row.year === jahr) {
      if (!seenYearTpops.has(row.place_id)) {
        seenYearTpops.add(row.place_id)
        inYear.tpop++
      }
      if (popId && !seenYearPops.has(popId)) {
        seenYearPops.add(popId)
        inYear.pop++
      }
    }
    if ((since == null || (row.year >= since && row.year <= jahr))) {
      if (!seenRangeTpops.has(row.place_id)) {
        seenRangeTpops.add(row.place_id)
        inRange.tpop++
      }
      if (popId && !seenRangePops.has(popId)) {
        seenRangePops.add(popId)
        inRange.pop++
      }
    }
  }
  void relevantPopIds

  return (
    <TableShell title={title}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{''}</th>
            <th>Pop {jahr}</th>
            <th>TPop {jahr}</th>
            <th>Pop seit {since ?? firstYear ?? '…'}</th>
            <th>TPop seit {since ?? firstYear ?? '…'}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>kontrolliert (inkl. Ansaatversuche)</td>
            <td className={styles.number}>{inYear.pop}</td>
            <td className={styles.number}>{inYear.tpop}</td>
            <td className={styles.number}>{inRange.pop}</td>
            <td className={styles.number}>{inRange.tpop}</td>
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
  const places = usePlaceRows(subprojectId)
  const startYear = useStartYear(subprojectId)
  const actionsRes = useLiveQuery(
    `SELECT a.place_id, extract(year from a.date)::int AS year
     FROM actions a
       INNER JOIN places p ON a.place_id = p.place_id
     WHERE p.subproject_id = $1 AND a.data ->> 'typ' IS NOT NULL`,
    [subprojectId ?? null],
  )
  const checksRes = useLiveQuery(
    `SELECT c.place_id, c.date, extract(year from c.date)::int AS year,
        c.data ->> 'erfolgsbeurteilung' AS assessment
     FROM checks c
       INNER JOIN places p ON c.place_id = p.place_id
     WHERE p.subproject_id = $1 AND c.data ->> 'erfolgsbeurteilung' IS NOT NULL
     ORDER BY c.date`,
    [subprojectId ?? null],
  )
  if (!subprojectId) return <NoContext label={title ?? 'Zwischenbilanz'} />

  const jahr = year ?? new Date().getFullYear()
  const actionRows = (actionsRes?.rows ?? []) as {
    place_id: string
    year: number
  }[]
  const checkRows = (checksRes?.rows ?? []) as {
    place_id: string
    year: number
    assessment: string
  }[]

  const relevantTpops = places.filter(
    (r) => r.level === 2 && r.relevant && (r.since ?? Infinity) <= jahr,
  )
  const relevantPopIds = new Set(
    relevantTpops.map((r) => r.parent_id).filter(Boolean) as string[],
  )
  const placeById = new Map(places.map((r) => [r.place_id, r]))

  const countPlaces = (placeIds: Set<string>) => {
    let pop = 0
    let tpop = 0
    for (const id of placeIds) {
      const place = placeById.get(id)
      if (!place || !place.relevant) continue
      if ((place.since ?? Infinity) > jahr) continue
      if (place.level === 2) {
        tpop++
        if (place.parent_id && relevantPopIds.has(place.parent_id)) {
          // pop counted once below via set
        }
      }
    }
    const popIds = new Set<string>()
    for (const id of placeIds) {
      const place = placeById.get(id)
      if (place?.level === 2 && place.parent_id && relevantPopIds.has(place.parent_id)) {
        popIds.add(place.parent_id)
      }
    }
    pop = popIds.size
    return { pop, tpop }
  }

  // places with actions in the report year / since start
  const withActionsYear = new Set<string>()
  const withActionsRange = new Set<string>()
  let firstMassn: number | null = actionRows.length
    ? Math.min(...actionRows.map((r) => r.year))
    : null
  for (const row of actionRows) {
    if (row.year === jahr) withActionsYear.add(row.place_id)
    withActionsRange.add(row.place_id)
  }
  const c1L = countPlaces(withActionsYear)
  const c1R = countPlaces(withActionsRange)

  // of those (since): controlled = latest assessed check per place
  const latestAssessment = new Map<string, string>()
  for (const row of checkRows) {
    if (withActionsRange.has(row.place_id) && row.year <= jahr) {
      latestAssessment.set(row.place_id, row.assessment)
    }
  }
  const c2R = countPlaces(new Set(latestAssessment.keys()))

  const classifyAssessment = (test: (a: string) => boolean) =>
    countPlaces(
      new Set(
        [...latestAssessment.entries()]
          .filter(([, a]) => test(a.toLowerCase()))
          .map(([id]) => id),
      ),
    )
  const sehr = classifyAssessment((a) => a.includes('sehr erfolgreich'))
  const nicht = classifyAssessment(
    (a) => a.includes('nicht erfolgreich') || a.includes('kein erfolg'),
  )
  const weniger = classifyAssessment(
    (a) => a.includes('wenig erfolgreich') || a.includes('weniger erfolgreich'),
  )
  const unsicher = classifyAssessment((a) => a.includes('unsicher'))
  const erfolgreich = classifyAssessment(
    (a) =>
      a.includes('erfolgreich') &&
      !a.includes('sehr ') &&
      !a.includes('wenig') &&
      !a.includes('weniger') &&
      !a.includes('nicht '),
  )

  const since = sinceYearProp ?? startYear
  const tableRows: {
    label: string
    year?: Counts
    range?: Counts
    indent?: number
  }[] = [
    {
      label: 'Anzahl Populationen/Teilpopulationen mit Massnahmen',
      year: c1L,
      range: c1R,
    },
    { label: 'kontrolliert', range: c2R, indent: 1 },
    { label: 'davon: sehr erfolgreich', range: sehr, indent: 2 },
    { label: 'erfolgreich', range: erfolgreich, indent: 2 },
    { label: 'weniger erfolgreich', range: weniger, indent: 2 },
    { label: 'nicht erfolgreich', range: nicht, indent: 2 },
    { label: 'mit unsicherer Wirkung', range: unsicher, indent: 2 },
  ]

  return (
    <TableShell title={title}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{''}</th>
            <th>Pop {jahr}</th>
            <th>TPop {jahr}</th>
            <th>Pop seit {since ?? firstMassn ?? '…'}</th>
            <th>TPop seit {since ?? firstMassn ?? '…'}</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, i) => (
            <tr key={`${i}-${row.label}`}>
              <td style={{ paddingLeft: `${(row.indent ?? 0) * 16}px` }}>
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
})
