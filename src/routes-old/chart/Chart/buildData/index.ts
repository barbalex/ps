import { processPlaces as countPlacesRows } from './countPlacesRows.ts'

export const buildData = async ({ db, chart, subjects, subproject_id }) => {
  const names = subjects.map((subject) => subject.name)

  const dataPerSubject = {}

  for (const subject of subjects) {
    switch (subject.value_source) {
      case 'count_rows': {
        switch (subject.table_name) {
          case 'places': {
            switch (subject.table_level) {
              case 1: {
                const res = await db.query(
                  `SELECT * FROM places WHERE subproject_id = $1 AND parent_id IS NULL`,
                  [subproject_id],
                )
                const places = res?.rows
                countPlacesRows({ dataPerSubject, places, subject })
                break
              }
              case 2: {
                const res = await db.query(
                  `SELECT * FROM places WHERE subproject_id = $1 and parent_id IS NOT NULL`,
                  [subproject_id],
                )
                const places = res?.rows
                countPlacesRows({ dataPerSubject, places, subject })
                break
              }
              default:
                break
            }
            break
          }
          case 'checks': {
            const resultChecks = await db.query(
              `
                SELECT checks.date 
                FROM 
                  checks inner join places 
                    on checks.place_id = places.place_id 
                WHERE places.subproject_id = $1
              `,
              [subproject_id],
            )
            const checks = resultChecks.rows
            // use reduce to count checks per year
            const data = checks.reduce((acc, check) => {
              const year = check.date?.getFullYear?.()
              if (!acc[year]) acc[year] = 0
              acc[year]++

              return acc
            }, {})
            dataPerSubject[subject.name] = data
            break
          }
          case 'actions': {
            const res = await db.query(
              `
                SELECT actions.date 
                FROM 
                  actions inner join places 
                    on actions.place_id = places.place_id 
                WHERE places.subproject_id = $1
              `,
              [subproject_id],
            )
            const actions = res?.rows
            // use reduce to count checks per year
            const data = actions.reduce((acc, check) => {
              const year = check.date?.getFullYear?.()
              if (!acc[year]) acc[year] = 0
              acc[year]++

              return acc
            }, {})
            dataPerSubject[subject.name] = data
            break
          }
          default:
            break
        }
        break
      }
      case 'count_rows_by_distinct_field_values': {
        // TODO: implement
        break
      }
      case 'sum_values_of_field': {
        // TODO: implement
        break
      }
      default:
        break
    }
  }

  const years = Object.values(dataPerSubject).reduce(
    (acc, data) => [...acc, ...Object.keys(data).map((k) => +k)],
    [],
  )

  let minYear = Math.min(...years)
  if (chart?.years_since && chart.years_since > minYear) {
    minYear = chart.years_since
  }
  let maxYear = Math.max(...years)
  if (chart?.years_until && chart.years_until < maxYear) {
    maxYear = chart.years_until
  }
  let yearRange = Array(maxYear - minYear + 1)
    .fill()
    .map((element, i) => minYear + i)
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
    const yearsData = { year }
    for (const name of names) {
      if (!dataPerSubject[name]?.[year]) continue
      yearsData[name] = dataPerSubject[name]?.[year]
    }

    return yearsData
  })

  return { data, years }
}
