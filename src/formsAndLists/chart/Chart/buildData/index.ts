import type { PGlite } from '@electric-sql/pglite'

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

export const buildData = async ({
  chart,
  subjects,
  subproject_id,
  db,
}: Props): Promise<ChartData> => {
  if (!subproject_id) return { data: [], years: [], series: [] }

  const series: ChartSeries[] = []
  const valuesPerSeries: Record<string, Record<number, number>> = {}

  const addSeries = (
    key: string,
    label: string,
    subject: ChartSubjects,
    values: Record<number, number>,
  ) => {
    series.push({ key, label, subject })
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
