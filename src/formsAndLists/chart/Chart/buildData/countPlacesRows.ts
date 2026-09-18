import type ChartSubjects from '../../../../models/public/ChartSubjects.ts'
import type Places from '../../../../models/public/Places.ts'

export const processPlaces = ({
  dataPerSubject,
  places,
  subject,
}: {
  dataPerSubject: Record<string, Record<number, number>>
  places: Places[]
  subject: ChartSubjects
}) => {
  const sinceYears = places.map((place) => place.since) as number[]
  const thisYear = new Date().getFullYear()
  const minYear = sinceYears.length ? Math.min(...sinceYears) : thisYear - 10
  const yearRange = Array(thisYear - minYear + 1)
    .fill(undefined)
    .map((_element, i) => minYear + i)
  const data: Record<number, number> = {}
  for (const year of yearRange) {
    const placesInYear = places.filter(
      (place) =>
        (place.since! <= year || !place.since) &&
        (place.until! >= year || !place.until),
    )
    data[year] = placesInYear.length
  }
  // console.log('hello dataFromChart, places level 1:', data)
  dataPerSubject[subject.name as string] = data
}
