/**
 * Detects coordinate fields from a list of field names
 * Returns an object with x_coordinate_field and y_coordinate_field
 */
export const detectCoordinateFields = (
  fields: string[],
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
      xField = fields[index]
      break
    }
  }

  // Find Y coordinate field
  for (const pattern of yPatterns) {
    const index = lowerFields.findIndex(
      (f) => f === pattern || f.includes(pattern),
    )
    if (index !== -1) {
      yField = fields[index]
      break
    }
  }

  return {
    x_coordinate_field: xField,
    y_coordinate_field: yField,
  }
}
