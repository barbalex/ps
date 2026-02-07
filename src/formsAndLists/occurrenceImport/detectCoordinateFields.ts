/**
 * Validates if a value looks like a valid coordinate
 */
const isValidCoordinate = (value: any, type: 'x' | 'y'): boolean => {
  if (value === null || value === undefined || value === '') return false

  const num = typeof value === 'number' ? value : parseFloat(value)

  if (isNaN(num)) return false

  // Longitude (X) should be between -180 and 180
  if (type === 'x') {
    return num >= -180 && num <= 180
  }

  // Latitude (Y) should be between -90 and 90
  return num >= -90 && num <= 90
}

/**
 * Checks if a field contains valid coordinate values
 * Samples up to 10 non-null values
 */
const validateFieldValues = (
  occurrences: any[],
  fieldName: string,
  type: 'x' | 'y',
): boolean => {
  if (!occurrences || occurrences.length === 0) return false

  let validCount = 0
  let totalChecked = 0
  const maxSample = Math.min(10, occurrences.length)

  for (let i = 0; i < occurrences.length && totalChecked < maxSample; i++) {
    const value = occurrences[i]?.data?.[fieldName]
    if (value !== null && value !== undefined && value !== '') {
      totalChecked++
      if (isValidCoordinate(value, type)) {
        validCount++
      }
    }
  }

  // At least 95% of sampled values should be valid
  return totalChecked > 0 && validCount / totalChecked >= 0.95
}

/**
 * Detects coordinate fields from field names and validates their values
 * Returns an object with x_coordinate_field and y_coordinate_field
 */
export const detectCoordinateFields = (
  fields: string[],
  occurrences?: any[],
): { x_coordinate_field: string | null; y_coordinate_field: string | null } => {
  if (!fields || fields.length === 0) {
    return { x_coordinate_field: null, y_coordinate_field: null }
  }

  // Convert all fields to lowercase for matching
  const lowerFields = fields.map((f) => f.toLowerCase())

  // Patterns for X coordinate (longitude)
  const xPatterns = [
    'longitude',
    'long',
    'lng',
    'lon',
    'decimal_longitude',
    'decimallongitude',
    'coordx',
    'coord_x',
    'easting',
    'x_coord',
    'xcoord',
    'x',
  ]

  // Patterns for Y coordinate (latitude)
  const yPatterns = [
    'latitude',
    'lat',
    'decimal_latitude',
    'decimallatitude',
    'coordy',
    'coord_y',
    'northing',
    'y_coord',
    'ycoord',
    'y',
  ]

  let xField = null
  let yField = null

  // Find X coordinate field
  for (const pattern of xPatterns) {
    const index = lowerFields.findIndex(
      (f) => f === pattern || f.includes(pattern),
    )
    if (index !== -1) {
      const candidate = fields[index]
      // If we have occurrences, validate the values
      if (!occurrences || validateFieldValues(occurrences, candidate, 'x')) {
        xField = candidate
        break
      }
    }
  }

  // Find Y coordinate field
  for (const pattern of yPatterns) {
    const index = lowerFields.findIndex(
      (f) => f === pattern || f.includes(pattern),
    )
    if (index !== -1) {
      const candidate = fields[index]
      // If we have occurrences, validate the values
      if (!occurrences || validateFieldValues(occurrences, candidate, 'y')) {
        yField = candidate
        break
      }
    }
  }

  // Cross-validate: check if the fields might be swapped
  // This can happen when both values fall within -90 to 90 range
  if (xField && yField && occurrences && occurrences.length > 0) {
    const xValues = occurrences
      .slice(0, 10)
      .map((o) => parseFloat(o?.data?.[xField]))
      .filter((v) => !isNaN(v))
    const yValues = occurrences
      .slice(0, 10)
      .map((o) => parseFloat(o?.data?.[yField]))
      .filter((v) => !isNaN(v))

    if (xValues.length > 0 && yValues.length > 0) {
      // Calculate ranges
      const xMin = Math.min(...xValues)
      const xMax = Math.max(...xValues)
      const yMin = Math.min(...yValues)
      const yMax = Math.max(...yValues)
      const xRange = xMax - xMin
      const yRange = yMax - yMin

      // Check if values suggest fields are swapped:
      // 1. X (longitude) typically has wider range than Y (latitude)
      // 2. If both are within -90 to 90, but Y has wider range, they might be swapped
      const bothInLatRange =
        xMin >= -90 && xMax <= 90 && yMin >= -90 && yMax <= 90
      const yRangeIsWider = yRange > xRange * 1.5 // Y range significantly wider

      if (bothInLatRange && yRangeIsWider) {
        // Values suggest fields might be swapped
        // But only swap if field names don't strongly indicate otherwise
        const xNameSuggestsLongitude = lowerFields[
          fields.indexOf(xField)
        ].includes('lon')
        const yNameSuggestsLatitude = lowerFields[
          fields.indexOf(yField)
        ].includes('lat')

        // Only swap if names don't strongly contradict the swap
        if (!xNameSuggestsLongitude && !yNameSuggestsLatitude) {
          const temp = xField
          xField = yField
          yField = temp
        }
      }
    }
  }

  return {
    x_coordinate_field: xField,
    y_coordinate_field: yField,
  }
}
