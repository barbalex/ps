export const processPlaces = ({ dataPerSubject, places, subject }) => {
  const sinceYears = places.map((place) => place.since)
  const thisYear = new Date().getFullYear()
  const minYear = sinceYears.length ? Math.min(...sinceYears) : thisYear - 10
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
}
