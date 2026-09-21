import type Places from '../../../../models/public/Places.ts'

type PlaceLike = Pick<Places, 'since' | 'until'>

/**
 * Counts, per year, how many of the given places existed in that year:
 * a place counts for every year from `since` (or the beginning of the range
 * if not set) up to `until` (or the current year if not set).
 */
export const countPlacesPerYear = (
  places: PlaceLike[],
): Record<number, number> => {
  const thisYear = new Date().getFullYear()
  const sinceYears = places
    .map((place) => place.since)
    .filter((since): since is number => since != null)
  const minYear = sinceYears.length ? Math.min(...sinceYears) : thisYear
  if (minYear > thisYear) return {}

  const data: Record<number, number> = {}
  for (let year = minYear; year <= thisYear; year++) {
    data[year] = places.filter(
      (place) =>
        (place.since == null || place.since <= year) &&
        (place.until == null || place.until >= year),
    ).length
  }

  return data
}
