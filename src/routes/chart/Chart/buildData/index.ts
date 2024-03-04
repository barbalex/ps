import { processPlaces } from './processPlaces'

export const buildData = async ({
  chart_id,
  db,
  chart,
  subjects,
  subproject_id,
}) => {
  const names = subjects.map((subject) => subject.name)

  const dataPerSubject = {}

  for (const subject of subjects) {
    switch (subject.value_source) {
      case 'count_rows': {
        switch (subject.table_name) {
          case 'places': {
            switch (subject.table_level) {
              case 1: {
                const places = await db.places.findMany({
                  where: {
                    subproject_id,
                    parent_id: null,
                    deleted: false,
                  },
                })
                processPlaces({ dataPerSubject, places, subject })
                break
              }
              case 2: {
                const places = await db.places.findMany({
                  where: {
                    subproject_id,
                    parent_id: { not: null },
                    deleted: false,
                  },
                })
                const sinceYears = places.map((place) => place.since)
                const thisYear = new Date().getFullYear()
                const minYear = sinceYears.length
                  ? Math.min(...sinceYears)
                  : thisYear - 10
                const yearRange = Array(thisYear - minYear + 1)
                  .fill()
                  .map((element, i) => minYear + i)
                const data = {}
                for (const year of yearRange) {
                  const placesInYear = places.filter(
                    (place) =>
                      (place.since <= year || !place.since) &&
                      (place.until >= year || !place.until),
                  )
                  data[year] = placesInYear.length
                }
                // console.log('hello dataFromChart, places level 1:', data)
                dataPerSubject[subject.name] = data
                break
              }
              default:
                break
            }
            break
          }
          case 'checks': {
            const places = await db.places.findMany({
              where: { subproject_id, deleted: false },
            })
            const placeIds = places.map((place) => place.place_id)
            const checks = await db.checks.findMany({
              where: { place_id: { in: placeIds }, deleted: false },
            })
            // use reduce to count checks per year
            const data = checks.reduce((acc, check) => {
              const year = check.date?.getFullYear?.()
              if (!acc[year]) acc[year] = 0
              acc[year]++

              return acc
            }, {})
            console.log('hello dataFromChart, checks:', data)
            dataPerSubject[subject.name] = data
            break
          }
          case 'actions': {
            const places = await db.places.findMany({
              where: { subproject_id, deleted: false },
            })
            const placeIds = places.map((place) => place.place_id)
            const actions = await db.actions.findMany({
              where: { place_id: { in: placeIds }, deleted: false },
            })
            // use reduce to count checks per year
            const data = actions.reduce((acc, check) => {
              const year = check.date?.getFullYear?.()
              if (!acc[year]) acc[year] = 0
              acc[year]++

              return acc
            }, {})
            console.log('hello dataFromChart, actions:', data)
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

  console.log('hello dataFromChart, dataPerSubject:', {
    dataPerSubject,
    chart_id,
  })
  const years = Object.values(dataPerSubject).reduce(
    (acc, data) => [...acc, ...Object.keys(data).map((k) => +k)],
    [],
  )

  let minYear = Math.min(...years)
  if (chart.years_since && chart.years_since > minYear) {
    minYear = chart.years_since
  }
  let maxYear = Math.max(...years)
  if (chart.years_until && chart.years_until < maxYear) {
    maxYear = chart.years_until
  }
  let yearRange = Array(maxYear - minYear + 1)
    .fill()
    .map((element, i) => minYear + i)
  if (chart.years_last_x) {
    yearRange.splice(0, yearRange.length - chart.years_last_x)
  }
  if (chart.years_specific) {
    yearRange = yearRange.filter((year) => year === chart.years_specific)
  }
  if (chart.years_current) {
    yearRange = yearRange.filter((year) => year === new Date().getFullYear())
  }
  if (chart.years_previous) {
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
  console.log('hello dataFromChart, data:', data)

  return { data, years }
}
