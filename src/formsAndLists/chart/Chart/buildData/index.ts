import type { PGlite } from '@electric-sql/pglite'

import {
  asOfYear,
  parseSysPeriod,
  statusCode,
  type VersionedRow,
} from '../../../../components/shared/reportVersions.ts'
import { countPlacesPerYear } from './countPlacesRows.ts'
import type Charts from '../../../../models/public/Charts.ts'
import type ChartSubjects from '../../../../models/public/ChartSubjects.ts'
import type Places from '../../../../models/public/Places.ts'

export type ChartSeries = {
  /** key of this series' values within the returned data rows */
  key: string
  /** label shown in the chart legend */
  label: string
  /** the subject the series was built from */
  subject: ChartSubjects
  /** stroke and fill color (auto-split series with a fixed color scheme) */
  color?: string
}

export type ChartData = {
  data: { year: number; [key: string]: number | undefined }[]
  years: number[]
  series: ChartSeries[]
}

/**
 * Groups series back by the subject they were built from — for charts that
 * render each subject in its own diagram (charts.subjects_single).
 */
export const groupSeriesBySubject = (series: ChartSeries[]) => {
  const groups = new Map<string, ChartSeries[]>()
  for (const singleSeries of series) {
    const subjectId = singleSeries.subject.chart_subject_id
    if (!groups.has(subjectId)) groups.set(subjectId, [])
    groups.get(subjectId)!.push(singleSeries)
  }

  return [...groups.values()]
}

type Props = {
  chart: Charts
  subjects: ChartSubjects[]
  subproject_id: string
  project_id?: string
  /** accepts plain PGlite instances as well as the live-extended one */
  db: Pick<PGlite, 'query'>
  /**
   * Server-side historized place versions (live + history). When given,
   * place series count, per year, the places as they were at the end of
   * that year; without it the current local state is used.
   */
  placesVersions?: VersionedRow[]
  /** historized subproject versions (for per-year start_jahr, like apf2) */
  subprojectsVersions?: VersionedRow[]
  /**
   * Year of the report the chart is built for. Like apflora, report charts
   * only show years with historizations, up to the report year — plus the
   * current year, if it is the report year (the live rows cover it).
   */
  reportYear?: number | null
}

/** label for a series that comes from a single subject (not auto-split) */
const subjectLabel = (subject: ChartSubjects) =>
  subject.name ?? subject.label ?? subject.chart_subject_id

/** sql fragment restricting places to a level, if the subject chose one */
const placeLevelFilter = (level: string | null | undefined) =>
  level === '1'
    ? 'p.parent_id IS NULL'
    : level === '2'
      ? 'p.parent_id IS NOT NULL'
      : 'TRUE'

/** level restriction for versioned place rows (level never changes) */
const versionLevelFilter = (level: string | null | undefined) => (row: VersionedRow) =>
  level === '1'
    ? row.parent_id == null
    : level === '2'
      ? row.parent_id != null
      : true

/** the status code of a versioned place row (from its data jsonb) */
const statusCodeOf = (row: VersionedRow): number | null => {
  const data = row.data as Record<string, unknown> | null
  return statusCode((data?.status as string | null) ?? null)
}

/** first year any of the versions or their since values reaches back to */
const minVersionYear = (rows: VersionedRow[]) => {
  const thisYear = new Date().getFullYear()
  const sinces = rows
    .map((row) => row.since as number | null | undefined)
    .filter((since): since is number => since != null)
  const lowerYears = rows
    .map((row) => parseSysPeriod(row.sys_period).lower)
    .filter((lower): lower is number => lower != null)
    .map((lower) => new Date(lower).getUTCFullYear())
  const all = [...sinces, ...lowerYears]
  return all.length ? Math.min(...all) : thisYear
}

/**
 * The places a chart year counts, mirroring apf2's chart functions
 * (tpop_kontrolliert_for_jber / pop_nach_status_for_jber): the year's
 * historization snapshot, without potential places (status 300) and without
 * places lacking bekannt_seit; tpops additionally need a non-potential,
 * known pop of that year and report relevance — and erloschen ones
 * (101/202) count only in the first year of that status.
 */
export const qualifyingRowsOfYear = (
  rows: VersionedRow[],
  year: number,
  level: string | null | undefined,
): VersionedRow[] => {
  const levelOk = versionLevelFilter(level)
  const yearRows = asOfYear(rows, year, 'place_id')
  const popsOfYear = new Map(
    yearRows
      .filter((row) => row.parent_id == null)
      .map((row) => [row.place_id as string, row]),
  )
  const prevRows = new Map(
    asOfYear(rows, year - 1, 'place_id').map((row) => [
      row.place_id as string,
      row,
    ]),
  )
  return yearRows.filter((row) => {
    if (!levelOk(row)) return false
    // ohne bekannt_seit zählt ein Ort nie (wie in apf2s SQL-Vergleichen)
    const since = row.since as number | null | undefined
    if (since == null || since > year) return false
    const code = statusCodeOf(row)
    if (code == null || code >= 300) return false
    if (row.parent_id == null) return true
    const pop = popsOfYear.get(row.parent_id as string)
    if (!pop) return false
    const popSince = pop.since as number | null | undefined
    if (popSince == null || popSince > year) return false
    const popCode = statusCodeOf(pop)
    if (popCode == null || popCode >= 300) return false
    if (row.relevant_for_reports === false) return false
    if (code === 101 || code === 202) {
      const prev = prevRows.get(row.place_id as string)
      if (prev && statusCodeOf(prev) === code) return false
    }
    return true
  })
}

/** per chart year, how many places count (apf2 rules, see above) */
const countPlaceVersionsPerYear = (
  rows: VersionedRow[],
  maxYear = new Date().getFullYear(),
  level?: string | null,
): Record<number, number> => {
  const data: Record<number, number> = {}
  for (let year = minVersionYear(rows); year <= maxYear; year++) {
    data[year] = qualifyingRowsOfYear(rows, year, level ?? null).length
  }
  return data
}

/** per year, places as of that year split by a data field's values */
const countPlaceVersionsByFieldPerYear = (
  rows: VersionedRow[],
  field: string,
  maxYear = new Date().getFullYear(),
): { name: string; values: Record<number, number> }[] => {
  const perGroup = new Map<string, Record<number, number>>()
  for (let year = minVersionYear(rows); year <= maxYear; year++) {
    for (const row of asOfYear(rows, year, 'place_id')) {
      const since = row.since as number | null | undefined
      if (since != null && since > year) continue
      const data = row.data as Record<string, unknown> | null
      const name = ((data?.[field] as string | undefined) ?? '(leer)').trim() || '(leer)'
      const values = perGroup.get(name) ?? {}
      values[year] = (values[year] ?? 0) + 1
      perGroup.set(name, values)
    }
  }
  return [...perGroup.entries()].map(([name, values]) => ({ name, values }))
}

/** turns {year, count} rows into a year→value record */
const rowsToRecord = (rows: { year: number; count: number }[]) => {
  const data: Record<number, number> = {}
  for (const row of rows) {
    if (row.year == null) continue
    data[row.year] = (data[row.year] ?? 0) + row.count
  }

  return data
}

const totalOf = (data: Record<number, number>) =>
  Object.values(data).reduce((acc, value) => acc + value, 0)

/** the chart years for a report: the historized years up to the report
 *  year, plus the current year when it is the report year */
const historizationYears = (
  versions: VersionedRow[],
  reportYear: number,
): number[] => {
  const years = new Set(
    versions
      .map((row) => parseSysPeriod(row.sys_period).lower)
      .filter((lower): lower is number => lower != null)
      .map((lower) => new Date(lower).getUTCFullYear())
      .filter((year) => year <= reportYear),
  )
  if (reportYear === new Date().getFullYear()) years.add(reportYear)
  return [...years].sort((a, b) => a - b)
}

/**
 * apf2's pop_nach_status_for_jber series: populations per historization year
 * in the six A-table categories. The vor/nach-AP split uses the start year
 * of the subproject's version of that year; pops need a report-relevant,
 * known tpop of that year (the SQL's inner join).
 */
const POP_STATUS_SERIES: { label: string; color: string }[] = [
  { label: 'ursprünglich, aktuell', color: '#2e7d32' },
  { label: 'angesiedelt (vor Beginn AP)', color: 'rgba(245,141,66,1)' },
  { label: 'angesiedelt (nach Beginn AP)', color: 'rgba(245,141,66,1)' },
  { label: 'Ansaatversuch', color: 'brown' },
  {
    label: 'erloschen (nach 1950): zuvor autochthon oder vor AP angesiedelt',
    color: 'rgba(46,125,50,0.5)',
  },
  {
    label: 'erloschen (nach 1950): nach Beginn Aktionsplan angesiedelt',
    color: 'rgba(245,141,66,0.5)',
  },
]

const popStatusSeriesPerYear = (
  places: VersionedRow[],
  subprojects: VersionedRow[],
  reportYear: number,
): { name: string; values: Record<number, number>; color: string }[] => {
  const groups = POP_STATUS_SERIES.map(({ label, color }) => ({
    name: label,
    color,
    values: {} as Record<number, number>,
  }))
  const groupByLabel = new Map(groups.map((g) => [g.name, g]))

  for (const year of historizationYears(places, reportYear)) {
    for (const group of groups) group.values[year] = 0
    const startYear = (() => {
      const subproject = asOfYear(subprojects, year, 'subproject_id')[0]
      return (subproject?.start_year as number | null | undefined) ?? null
    })()
    const yearRows = asOfYear(places, year, 'place_id')
    // pops need a report-relevant, known tpop of that year (inner join);
    // the tpop's own status does not matter here
    const parentsWithRelevantTpop = new Set(
      yearRows
        .filter(
          (row) =>
            row.parent_id != null &&
            row.since != null &&
            (row.since as number) <= year &&
            row.relevant_for_reports !== false,
        )
        .map((row) => row.parent_id as string),
    )
    for (const pop of yearRows) {
      if (pop.parent_id != null) continue
      const since = pop.since as number | null | undefined
      if (since == null || since > year) continue
      if (!parentsWithRelevantTpop.has(pop.place_id as string)) continue
      const code = statusCodeOf(pop)
      const label = (() => {
        if (code === 100) return 'ursprünglich, aktuell'
        if (code === 201) return 'Ansaatversuch'
        if (startYear == null) return null
        if (code === 200) {
          return since < startYear ?
              'angesiedelt (vor Beginn AP)'
            : 'angesiedelt (nach Beginn AP)'
        }
        if (code === 101) {
          return 'erloschen (nach 1950): zuvor autochthon oder vor AP angesiedelt'
        }
        if (code === 202) {
          return since < startYear ?
              'erloschen (nach 1950): zuvor autochthon oder vor AP angesiedelt'
            : 'erloschen (nach 1950): nach Beginn Aktionsplan angesiedelt'
        }
        return null
      })()
      const group = label != null ? groupByLabel.get(label) : undefined
      if (group) group.values[year] = (group.values[year] ?? 0) + 1
    }
  }
  return groups
}

export const buildData = async ({
  chart,
  subjects,
  subproject_id,
  db,
  placesVersions,
  subprojectsVersions,
  reportYear,
}: Props): Promise<ChartData> => {
  if (!subproject_id) return { data: [], years: [], series: [] }

  const series: ChartSeries[] = []
  const valuesPerSeries: Record<string, Record<number, number>> = {}

  const addSeries = (
    key: string,
    label: string,
    subject: ChartSubjects,
    values: Record<number, number>,
    color?: string,
  ) => {
    series.push({ key, label, subject, color })
    valuesPerSeries[key] = values
  }

  /**
   * Auto-split subjects produce one series per distinct value / per place.
   * Largest total first so it lands at the bottom of a stack.
   */
  const addSplitSeries = (
    subject: ChartSubjects,
    groups: { name: string; values: Record<number, number> }[],
  ) => {
    const sorted = groups.sort(
      (a, b) => totalOf(b.values) - totalOf(a.values) || a.name.localeCompare(b.name),
    )
    for (const group of sorted) {
      addSeries(`${subject.chart_subject_id}:${group.name}`, group.name, subject, group.values)
    }
  }

  for (const subject of subjects) {
    switch (subject.calc_method) {
      case 'count_rows': {
        switch (subject.table_name) {
          case 'places': {
            if (placesVersions) {
              const rows = placesVersions.filter(versionLevelFilter(subject.table_level))
              addSeries(
                subjectLabel(subject),
                subjectLabel(subject),
                subject,
                countPlaceVersionsPerYear(
                  rows,
                  reportYear ?? undefined,
                  subject.table_level,
                ),
              )
              break
            }
            const res = await db.query(
              `SELECT * FROM places p WHERE p.subproject_id = $1 AND ${placeLevelFilter(subject.table_level)}`,
              [subproject_id],
            )
            const places = res?.rows as unknown as Places[]
            addSeries(
              subjectLabel(subject),
              subjectLabel(subject),
              subject,
              countPlacesPerYear(places),
            )
            break
          }
          case 'checks':
          case 'actions': {
            const res = await db.query(
              `
                SELECT extract(year from t.date)::int AS year,
                  count(DISTINCT t.place_id)::int AS count
                FROM ${subject.table_name} t
                  INNER JOIN places p ON t.place_id = p.place_id
                WHERE p.subproject_id = $1 AND ${placeLevelFilter(subject.table_level)}
                GROUP BY 1
              `,
              [subproject_id],
            )
            addSeries(
              subjectLabel(subject),
              subjectLabel(subject),
              subject,
              rowsToRecord(res?.rows as { year: number; count: number }[]),
            )
            break
          }
          case 'check_reports': {
            // apf2's kontrolliert series counts the yearly place reports
            // (tpopber) on the qualifying tpops of each historization year
            const res = await db.query(
              `SELECT r.place_id, r.year FROM check_reports r
                 INNER JOIN places p ON r.place_id = p.place_id
               WHERE p.subproject_id = $1`,
              [subproject_id],
            )
            const berRows = (res?.rows ?? []) as {
              place_id: string
              year: number | null
            }[]
            if (placesVersions && reportYear != null) {
              const values: Record<number, number> = {}
              for (const year of historizationYears(placesVersions, reportYear)) {
                const ids = new Set(
                  qualifyingRowsOfYear(placesVersions, year, subject.table_level)
                    .filter((row) => row.parent_id != null)
                    .map((row) => row.place_id as string),
                )
                values[year] = berRows.filter(
                  (b) => b.year === year && ids.has(b.place_id),
                ).length
              }
              addSeries(subjectLabel(subject), subjectLabel(subject), subject, values)
            } else {
              const perYear = new Map<number, Set<string>>()
              for (const ber of berRows) {
                if (ber.year == null) continue
                const set = perYear.get(ber.year) ?? new Set<string>()
                set.add(ber.place_id)
                perYear.set(ber.year, set)
              }
              addSeries(
                subjectLabel(subject),
                subjectLabel(subject),
                subject,
                Object.fromEntries([...perYear.entries()].map(([y, set]) => [y, set.size])),
              )
            }
            break
          }
          default:
            break
        }
        break
      }
      case 'count_rows_by_distinct_field_values': {
        // field addresses a key within the table's data jsonb
        const field = subject.field
        if (!field) {
          console.warn(
            'chart subject without field for count_rows_by_distinct_field_values:',
            subject.chart_subject_id,
          )
          break
        }
        switch (subject.table_name) {
          case 'places': {
            if (placesVersions && subprojectsVersions && reportYear != null && subject.table_level === '1') {
              // apf2's Populationen-nach-Status series (pop_nach_status_for_jber)
              for (const group of popStatusSeriesPerYear(
                placesVersions,
                subprojectsVersions,
                reportYear,
              )) {
                addSeries(
                  `${subject.chart_subject_id}:${group.name}`,
                  group.name,
                  subject,
                  group.values,
                  group.color,
                )
              }
              break
            }
            if (placesVersions) {
              const rows = placesVersions.filter(versionLevelFilter(subject.table_level))
              addSplitSeries(
                subject,
                countPlaceVersionsByFieldPerYear(rows, field, reportYear ?? undefined),
              )
              break
            }
            const res = await db.query(
              `SELECT p.data ->> $2 AS value, p.since, p.until FROM places p WHERE p.subproject_id = $1 AND ${placeLevelFilter(subject.table_level)}`,
              [subproject_id, field],
            )
            const rows = res?.rows as unknown as ( {
              value: string | null
            } & Places )[]
            const grouped = new Map<string, Places[]>()
            for (const row of rows) {
              const name = row.value ?? '(leer)'
              if (!grouped.has(name)) grouped.set(name, [])
              grouped.get(name)!.push(row)
            }
            addSplitSeries(
              subject,
              [...grouped.entries()].map(([name, places]) => ({
                name,
                values: countPlacesPerYear(places),
              })),
            )
            break
          }
          case 'checks':
          case 'actions': {
            const res = await db.query(
              `
                SELECT t.data ->> $2 AS value,
                  extract(year from t.date)::int AS year,
                  count(DISTINCT t.place_id)::int AS count
                FROM ${subject.table_name} t
                  INNER JOIN places p ON t.place_id = p.place_id
                WHERE p.subproject_id = $1 AND ${placeLevelFilter(subject.table_level)}
                GROUP BY 1, 2
              `,
              [subproject_id, field],
            )
            const rows = res?.rows as {
              value: string | null
              year: number
              count: number
            }[]
            const grouped = new Map<string, { year: number; count: number }[]>()
            for (const row of rows) {
              const name = row.value ?? '(leer)'
              if (!grouped.has(name)) grouped.set(name, [])
              grouped.get(name)!.push({ year: row.year, count: row.count })
            }
            addSplitSeries(
              subject,
              [...grouped.entries()].map(([name, countRows]) => ({
                name,
                values: rowsToRecord(countRows),
              })),
            )
            break
          }
          default:
            break
        }
        break
      }
      case 'sum_values_of_field': {
        const field = subject.field
        if (field !== 'quantity_integer' && field !== 'quantity_numeric') {
          console.warn(
            'chart subject with unsupported field for sum_values_of_field:',
            subject.chart_subject_id,
          )
          break
        }
        switch (subject.table_name) {
          case 'check_quantities':
          case 'check_taxa':
          case 'action_quantities':
          case 'action_taxa': {
            // checks/actions hold the date; places provide the grouping level
            const eventTable =
              subject.table_name.startsWith('check') ? 'checks' : 'actions'
            const eventId =
              subject.table_name.startsWith('check') ? 'check_id' : 'action_id'
            const params: (string | number | null)[] = [subproject_id]
            let unitFilter = ''
            if (subject.value_unit) {
              unitFilter = 'AND q.unit_id = $2'
              params.push(subject.value_unit)
            }
            // level 1 groups by the parent place (population), level 2 by the
            // checked/treated place itself; without level a single series sums
            // everything
            const split = subject.table_level === '1' || subject.table_level === '2'
            const groupJoin = split
              ? subject.table_level === '1'
                ? 'INNER JOIN places gp ON gp.place_id = coalesce(p.parent_id, p.place_id)'
                : 'INNER JOIN places gp ON gp.place_id = p.place_id'
              : ''
            const groupSelect = split
              ? `, coalesce(nullif(gp.label, ''), nullif(gp.name, ''), gp.place_id::text) AS group_label`
              : ''
            const groupBy = split ? ', gp.place_id, gp.label, gp.name' : ''
            const res = await db.query(
              `
                SELECT extract(year from t.date)::int AS year,
                  sum(q.${field}) AS total${groupSelect}
                FROM ${subject.table_name} q
                  INNER JOIN ${eventTable} t ON q.${eventId} = t.${eventId}
                  INNER JOIN places p ON t.place_id = p.place_id
                  ${groupJoin}
                WHERE p.subproject_id = $1 ${unitFilter}
                GROUP BY 1${groupBy}
              `,
              params,
            )
            const rows = res?.rows as { year: number; total: number; group_label?: string }[]
            if (!split) {
              const values: Record<number, number> = {}
              for (const row of rows) {
                if (row.year == null) continue
                values[row.year] = (values[row.year] ?? 0) + Number(row.total ?? 0)
              }
              addSeries(
                subjectLabel(subject),
                subjectLabel(subject),
                subject,
                values,
              )
            } else {
              const grouped = new Map<string, { year: number; count: number }[]>()
              for (const row of rows) {
                const name = row.group_label ?? '(leer)'
                if (!grouped.has(name)) grouped.set(name, [])
                grouped.get(name)!.push({ year: row.year, count: Number(row.total ?? 0) })
              }
              addSplitSeries(
                subject,
                [...grouped.entries()].map(([name, sumRows]) => ({
                  name,
                  values: rowsToRecord(sumRows),
                })),
              )
            }
            break
          }
          default:
            break
        }
        break
      }
      default:
        break
    }
  }

  const years = Object.values(valuesPerSeries).reduce<number[]>(
    (acc, data) => [...acc, ...Object.keys(data).map((k) => +k)],
    [],
  )
  if (!years.length) return { data: [], years: [], series }

  let minYear = Math.min(...years)
  if (chart?.years_since && chart.years_since > minYear) {
    minYear = chart.years_since
  }
  let maxYear = Math.max(...years)
  if (chart?.years_until && chart.years_until < maxYear) {
    maxYear = chart.years_until
  }
  let yearRange = Array(maxYear - minYear + 1)
    .fill(undefined)
    .map((_element, i) => minYear + i)
  if (reportYear != null && placesVersions) {
    yearRange = historizationYears(placesVersions, reportYear)
  }
  if (chart?.years_last_x) {
    yearRange.splice(0, yearRange.length - chart.years_last_x)
  }
  if (chart?.years_specific) {
    yearRange = yearRange.filter((year) => year === chart.years_specific)
  }
  if (chart?.years_current) {
    yearRange = yearRange.filter((year) => year === new Date().getFullYear())
  }
  if (chart?.years_previous) {
    yearRange = yearRange.filter(
      (year) => year === new Date().getFullYear() - 1,
    )
  }

  const data = yearRange.map((year) => {
    const yearsData: { year: number; [key: string]: number | undefined } = {
      year,
    }
    for (const singleSeries of series) {
      const value = valuesPerSeries[singleSeries.key]?.[year]
      if (!value) continue
      yearsData[singleSeries.key] = value
    }

    return yearsData
  })

  return { data, years, series }
}
