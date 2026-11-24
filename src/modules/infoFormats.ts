// Response formats of GetFeatureInfo (WMS) and GetFeature (WFS), ordered by how well
// the info drawer can show them: GeoJSON has the same shape from every server, GML and
// the other XML flavours are read structurally, plain text and html are shown as delivered.
const rankOf = (format: string): number => {
  const lower = format.trim().toLowerCase()
  if (lower.includes('geojson') || lower.includes('geo+json')) return 0
  if (lower.includes('json')) return 1
  if (lower.includes('gml')) return 2
  if (lower.includes('xml')) return 3
  if (lower === 'text/plain') return 4
  if (lower.includes('html')) return 5
  return 6
}

// the formats ordered by rank — the order of the list kept within a rank,
// empties and equals dropped
export const rankedInfoFormats = (formats: readonly unknown[]): string[] => {
  const unique: string[] = []
  for (const format of formats ?? []) {
    if (
      typeof format === 'string' &&
      format.trim() &&
      !unique.some(
        (seen) => seen.trim().toLowerCase() === format.trim().toLowerCase(),
      )
    ) {
      unique.push(format)
    }
  }
  return unique
    .map((format, index) => ({ format, index, rank: rankOf(format) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((entry) => entry.format)
}

// the formats to try for one request, most promising first
export const infoFormatCandidates = ({
  infoFormat,
  infoFormats,
  fallback,
}: {
  // the format stored with the service
  infoFormat?: string | null
  // the formats the service advertises
  infoFormats?: readonly unknown[] | null
  // what to try once the service's own formats are exhausted
  fallback: (string | undefined)[]
}): (string | undefined)[] => {
  // what the service has, then the defaults — in case its list is wrong
  const own = rankedInfoFormats([infoFormat, ...(infoFormats ?? [])])
  return [
    ...own,
    ...fallback.filter(
      (format) => format === undefined || !own.includes(format),
    ),
  ]
}
