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

const emptyCounts: Counts = { pop: 0, tpop: 0 }

const addCounts = (acc: Counts, level: number | null, n: number) => {
  if (level === 1) acc.pop += n
  else if (level === 2) acc.tpop += n
}

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

const GrundmengenTable = ({ title }: { title?: string }) => {
  const { subprojectId } = useSubprojectReportContext()
  const res = useLiveQuery(
    `SELECT level, COALESCE(data ->> 'status', '') AS status, count(*)::int AS n
     FROM places
     WHERE subproject_id = $1
     GROUP BY 1, 2`,
    [subprojectId ?? null],
  )
  if (!subprojectId) return <NoContext label={title ?? 'Grundmengen'} />

  const rows = (res?.rows ?? []) as {
    level: number | null
    status: string
    n: number
  }[]

  const classify = (test: (status: string) => boolean): Counts => {
    const acc = { ...emptyCounts }
    for (const row of rows) {
      if (test(row.status)) addCounts(acc, row.level, row.n)
    }
    return acc
  }

  const isKnown = (s: string) =>
    s !== '' &&
    !s.toLowerCase().startsWith('potentieller') &&
    !s.toLowerCase().includes('ansaatversuch')
  const bekannt = classify(isKnown)
  const aktuell = classify((s) => isKnown(s) && s.includes('aktuell'))
  const ursprAktuell = classify(
    (s) => s.includes('aktuell') && s.startsWith('ursprünglich'),
  )
  const angesiedeltAktuell = classify(
    (s) => s.includes('aktuell') && s.startsWith('angesiedelt'),
  )
  const erloschen = classify((s) => isKnown(s) && s.includes('erloschen'))
  const ursprErloschen = classify(
    (s) => s.includes('erloschen') && s.startsWith('ursprünglich'),
  )
  const angesiedeltErloschen = classify(
    (s) => s.includes('erloschen') && s.startsWith('angesiedelt'),
  )
  const ansaatversuche = classify((s) =>
    s.toLowerCase().includes('ansaatversuch'),
  )
  const potentielle = classify((s) =>
    s.toLowerCase().startsWith('potentieller'),
  )

  const tableRows: { label: string; counts: Counts; indent?: number }[] = [
    { label: 'Anzahl bekannt', counts: bekannt },
    { label: 'aktuell', counts: aktuell, indent: 1 },
    { label: 'davon: ursprünglich', counts: ursprAktuell, indent: 2 },
    { label: 'angesiedelt', counts: angesiedeltAktuell, indent: 2 },
    { label: 'erloschen', counts: erloschen, indent: 1 },
    {
      label: 'davon: ursprünglich (autochthon)',
      counts: ursprErloschen,
      indent: 2,
    },
    { label: 'angesiedelt', counts: angesiedeltErloschen, indent: 2 },
    { label: 'Ansaatversuche', counts: ansaatversuche },
    { label: 'potentielle Wuchs-/Ansiedlungsorte', counts: potentielle },
  ]

  return (
    <TableShell title={title}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{''}</th>
            <th>Pop</th>
            <th>TPop</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, i) => (
            <tr key={`${i}-${row.label}`}>
              <td
                style={{ paddingLeft: `${(row.indent ?? 0) * 16}px` }}
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
  const startYearRes = useLiveQuery(
    `SELECT start_year FROM subprojects WHERE subproject_id = $1`,
    [subprojectId ?? null],
  )
  const startYear =
    sinceYearProp ??
    ((startYearRes?.rows?.[0] as { start_year: number | null } | undefined)
      ?.start_year ??
      null)

  const res = useLiveQuery(
    `SELECT p.level, p.place_id, extract(year from c.date)::int AS year
     FROM checks c
       INNER JOIN places p ON c.place_id = p.place_id
     WHERE p.subproject_id = $1`,
    [subprojectId ?? null],
  )
  if (!subprojectId) return <NoContext label={title ?? 'Bestandesentwicklung'} />

  const reportYear = year ?? new Date().getFullYear()
  const rows = (res?.rows ?? []) as {
    level: number | null
    place_id: string
    year: number
  }[]

  const inYear = { ...emptyCounts }
  const inRange = { ...emptyCounts }
  const seenYear = new Set<string>()
  const seenRange = new Set<string>()
  for (const row of rows) {
    const inRangeYear =
      !startYear || (row.year >= startYear && row.year <= reportYear)
    if (row.year === reportYear && !seenYear.has(row.place_id)) {
      seenYear.add(row.place_id)
      addCounts(inYear, row.level, 1)
    }
    if (inRangeYear && !seenRange.has(row.place_id)) {
      seenRange.add(row.place_id)
      addCounts(inRange, row.level, 1)
    }
  }

  return (
    <TableShell title={title}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{''}</th>
            <th>Pop {reportYear}</th>
            <th>TPop {reportYear}</th>
            <th>
              Pop seit {startYear ?? '…'}
            </th>
            <th>TPop seit {startYear ?? '…'}</th>
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
  const startYearRes = useLiveQuery(
    `SELECT start_year FROM subprojects WHERE subproject_id = $1`,
    [subprojectId ?? null],
  )
  const startYear =
    sinceYearProp ??
    ((startYearRes?.rows?.[0] as { start_year: number | null } | undefined)
      ?.start_year ??
      null)

  const actionsRes = useLiveQuery(
    `SELECT p.level, p.place_id, extract(year from a.date)::int AS year
     FROM actions a
       INNER JOIN places p ON a.place_id = p.place_id
     WHERE p.subproject_id = $1`,
    [subprojectId ?? null],
  )
  const checksRes = useLiveQuery(
    `SELECT p.place_id, extract(year from c.date)::int AS year, c.date,
        c.data ->> 'erfolgsbeurteilung' AS assessment
     FROM checks c
       INNER JOIN places p ON c.place_id = p.place_id
     WHERE p.subproject_id = $1 AND c.data ->> 'erfolgsbeurteilung' IS NOT NULL
     ORDER BY c.date`,
    [subprojectId ?? null],
  )
  if (!subprojectId) return <NoContext label={title ?? 'Zwischenbilanz'} />

  const reportYear = year ?? new Date().getFullYear()
  const actionRows = (actionsRes?.rows ?? []) as {
    level: number | null
    place_id: string
    year: number
  }[]
  const checkRows = (checksRes?.rows ?? []) as {
    place_id: string
    year: number
    assessment: string
  }[]

  const withActionsYear = { ...emptyCounts }
  const withActionsRange = { ...emptyCounts }
  const seenYear = new Set<string>()
  const seenRange = new Set<string>()
  for (const row of actionRows) {
    if (row.year === reportYear && !seenYear.has(row.place_id)) {
      seenYear.add(row.place_id)
      addCounts(withActionsYear, row.level, 1)
    }
    const inRange =
      !startYear || (row.year >= startYear && row.year <= reportYear)
    if (inRange && !seenRange.has(row.place_id)) {
      seenRange.add(row.place_id)
      addCounts(withActionsRange, row.level, 1)
    }
  }

  // of the places with actions: those controlled, grouped by the assessment
  // of their latest assessed check
  const latestAssessment = new Map<string, string>()
  const controlled = new Set<string>()
  const controlledLevels = new Map<string, number | null>()
  for (const row of checkRows) {
    const inRange = !startYear || (row.year >= startYear && row.year <= reportYear)
    if (inRange && seenRange.has(row.place_id)) {
      controlled.add(row.place_id)
      if (!controlledLevels.has(row.place_id)) {
        controlledLevels.set(
          row.place_id,
          actionRows.find((a) => a.place_id === row.place_id)?.level ?? null,
        )
      }
      latestAssessment.set(row.place_id, row.assessment)
    }
  }
  const controlledCounts = { ...emptyCounts }
  for (const level of controlledLevels.values()) {
    addCounts(controlledCounts, level, 1)
  }

  const classifyAssessment = (test: (a: string) => boolean): Counts => {
    const acc = { ...emptyCounts }
    for (const [placeId, assessment] of latestAssessment) {
      if (test(assessment)) {
        addCounts(acc, controlledLevels.get(placeId) ?? null, 1)
      }
    }
    return acc
  }
  const sehrErfolgreich = classifyAssessment((a) =>
    a.toLowerCase().includes('sehr erfolgreich'),
  )
  const erfolgreich = classifyAssessment(
    (a) =>
      a.toLowerCase().includes('erfolgreich') &&
      !a.toLowerCase().includes('sehr ') &&
      !a.toLowerCase().includes('weniger ') &&
      !a.toLowerCase().includes('nicht '),
  )
  const wenigerErfolgreich = classifyAssessment((a) =>
    a.toLowerCase().includes('weniger erfolgreich'),
  )
  const nichtErfolgreich = classifyAssessment((a) =>
    a.toLowerCase().includes('nicht erfolgreich'),
  )
  const unsicher = classifyAssessment((a) =>
    a.toLowerCase().includes('unsicher'),
  )

  const tableRows: { label: string; year?: Counts; range?: Counts; indent?: number }[] = [
    {
      label: 'Anzahl Populationen/Teilpopulationen mit Massnahmen',
      year: withActionsYear,
      range: withActionsRange,
    },
    { label: 'kontrolliert', range: controlledCounts, indent: 1 },
    { label: 'davon: sehr erfolgreich', range: sehrErfolgreich, indent: 2 },
    { label: 'erfolgreich', range: erfolgreich, indent: 2 },
    { label: 'weniger erfolgreich', range: wenigerErfolgreich, indent: 2 },
    { label: 'nicht erfolgreich', range: nichtErfolgreich, indent: 2 },
    { label: 'mit unsicherer Wirkung', range: unsicher, indent: 2 },
  ]

  return (
    <TableShell title={title}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{''}</th>
            <th>Pop {reportYear}</th>
            <th>TPop {reportYear}</th>
            <th>Pop seit {startYear ?? '…'}</th>
            <th>TPop seit {startYear ?? '…'}</th>
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
