/**
 * Validates if a value looks like a valid coordinate
 */
const isValidCoordinate = (value: any, type: 'x' | 'y'): boolean => {
  if (value === null || value === undefined || value === '') return false

  const num = typeof value === 'number' ? value : parseFloat(value)

  if (isNaN(num)) return false

  // X is now latitude, should be between -90 and 90
  if (type === 'x') {
    return num >= -90 && num <= 90
  }

  // Y is now longitude, should be between -180 and 180
  return num >= -180 && num <= 180
}

/**
 * Checks if a field contains valid coordinate values
 * Samples up to 10 non-null values
 */
const validateFieldValues = (
  observations: any[],
  fieldName: string,
  type: 'x' | 'y',
): boolean => {
  if (!observations || observations.length === 0) return false

  let validCount = 0
  let totalChecked = 0
  const maxSample = Math.min(10, observations.length)

  for (let i = 0; i < observations.length && totalChecked < maxSample; i++) {
    const value = observations[i]?.data?.[fieldName]
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
  observations?: any[],
): { x_coordinate_field: string | null; y_coordinate_field: string | null } => {
  if (!fields || fields.length === 0) {
    return { x_coordinate_field: null, y_coordinate_field: null }
  }

  // Convert all fields to lowercase for matching
  const lowerFields = fields.map((f) => f.toLowerCase())

  // Patterns for X coordinate (latitude)
  const xPatterns = [
    'latitude',
    'lat',
    'decimal_latitude',
    'decimallatitude',
    'coordx',
    'coord_x',
    'northing',
    'x_coord',
    'xcoord',
    'x',
  ]

  // Patterns for Y coordinate (longitude)
  const yPatterns = [
    'longitude',
    'long',
    'lng',
    'lon',
    'decimal_longitude',
    'decimallongitude',
    'coordy',
    'coord_y',
    'easting',
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
      // If we have observations, validate the values
      if (!observations || validateFieldValues(observations, candidate, 'x')) {
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
      // If we have observations, validate the values
      if (!observations || validateFieldValues(observations, candidate, 'y')) {
        yField = candidate
        break
      }
    }
  }

  // No cross-validation based on ranges needed
  // Swiss LV95 and other coordinate systems may have different conventions
  // Trust the field names rather than value ranges

  return {
    x_coordinate_field: xField,
    y_coordinate_field: yField,
  }
}
