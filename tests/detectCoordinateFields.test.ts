import { describe, it, expect } from 'vitest'

import { detectCoordinateFields } from '../src/formsAndLists/observationImport/detectCoordinateFields.ts'

const observation = (x: unknown, y: unknown) => ({
  data: { latitude: x, longitude: y },
})

describe('detectCoordinateFields', () => {
  it('returns null for both when no fields exist', () => {
    expect(detectCoordinateFields([])).toEqual({
      x_coordinate_field: null,
      y_coordinate_field: null,
    })
  })

  it('detects latitude/longitude by name, preserving original casing', () => {
    expect(detectCoordinateFields(['Latitude', 'Longitude'])).toEqual({
      x_coordinate_field: 'Latitude',
      y_coordinate_field: 'Longitude',
    })
  })

  it('matches common variants (decimallatitude, y_coord, easting, lng...)', () => {
    expect(detectCoordinateFields(['decimallatitude', 'lng'])).toEqual({
      x_coordinate_field: 'decimallatitude',
      y_coordinate_field: 'lng',
    })
    expect(detectCoordinateFields(['northing', 'easting'])).toEqual({
      x_coordinate_field: 'northing',
      y_coordinate_field: 'easting',
    })
  })

  it('prefers the most specific pattern over a later generic one', () => {
    // 'latitude' is checked before 'x' — so it wins even if
    // an 'x' field appears earlier in the list
    expect(detectCoordinateFields(['x', 'latitude'])).toEqual({
      x_coordinate_field: 'latitude',
      y_coordinate_field: null,
    })
  })

  it('rejects a candidate when sampled values are outside the expected range', () => {
    // x = latitude must be within -90..90 — LV95-style values are not
    const observations = Array.from({ length: 10 }, () =>
      observation(2600000, 1200000),
    )
    expect(
      detectCoordinateFields(['latitude', 'longitude'], observations),
    ).toEqual({ x_coordinate_field: null, y_coordinate_field: null })
  })

  it('accepts a candidate when at least 95% of sampled values are valid', () => {
    // 9 valid + 1 invalid = 90% -> rejected
    const mostlyValid = Array.from({ length: 10 }, (_, i) =>
      observation(i === 0 ? 999 : 46.5, i === 0 ? 999 : 7.4),
    )
    expect(
      detectCoordinateFields(['latitude', 'longitude'], mostlyValid),
    ).toEqual({ x_coordinate_field: null, y_coordinate_field: null })

    // 10 valid = 100% -> accepted
    const allValid = Array.from({ length: 10 }, () => observation(46.5, 7.4))
    expect(
      detectCoordinateFields(['latitude', 'longitude'], allValid),
    ).toEqual({ x_coordinate_field: 'latitude', y_coordinate_field: 'longitude' })
  })

  it('accepts string coordinates by parsing them', () => {
    const observations = Array.from({ length: 10 }, () =>
      observation('46.5', '7.4'),
    )
    expect(
      detectCoordinateFields(['latitude', 'longitude'], observations),
    ).toEqual({ x_coordinate_field: 'latitude', y_coordinate_field: 'longitude' })
  })

  it('skips null/empty values when sampling', () => {
    const observations = Array.from({ length: 10 }, (_, i) =>
      i === 0 ? observation(null, '') : observation(46.5, 7.4),
    )
    expect(
      detectCoordinateFields(['latitude', 'longitude'], observations),
    ).toEqual({ x_coordinate_field: 'latitude', y_coordinate_field: 'longitude' })
  })
})
