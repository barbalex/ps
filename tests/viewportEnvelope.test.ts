import { describe, it, expect } from 'vitest'

import {
  envelopeContains,
  padBounds,
  resolveViewportEnvelope,
  viewportEitherPredicate,
  viewportParams,
  viewportPredicate,
} from '../src/components/Map/layers/viewportEnvelope.ts'

const bounds = (
  swLng: number,
  swLat: number,
  neLng: number,
  neLat: number,
) => ({ swLng, swLat, neLng, neLat })

describe('padBounds', () => {
  it('pads each axis by 50% of its extent', () => {
    // whole numbers keep the arithmetic exact: 1° per axis -> 2° total
    expect(padBounds(bounds(8, 47, 9, 48))).toEqual(bounds(7.5, 46.5, 9.5, 48.5))
  })

  it('supports a custom factor', () => {
    expect(padBounds(bounds(8, 47, 9, 48), 0.1)).toEqual(
      bounds(7.9, 46.9, 9.1, 48.1),
    )
  })

  it('clamps to the world', () => {
    expect(padBounds(bounds(-179.9, -89.9, 179.9, 89.9))).toEqual(
      bounds(-180, -90, 180, 90),
    )
  })
})

describe('envelopeContains', () => {
  const outer = bounds(8, 47, 9, 48)

  it('accepts equal and inner bounds (inclusive edges)', () => {
    expect(envelopeContains(outer, outer)).toBe(true)
    expect(envelopeContains(bounds(8.1, 47.1, 8.9, 47.9), outer)).toBe(true)
    expect(envelopeContains(bounds(8, 47, 8.5, 47.5), outer)).toBe(true)
  })

  it('rejects bounds sticking out on any side', () => {
    expect(envelopeContains(bounds(7.9, 47.1, 8.9, 47.9), outer)).toBe(false)
    expect(envelopeContains(bounds(8.1, 46.9, 8.9, 47.9), outer)).toBe(false)
    expect(envelopeContains(bounds(8.1, 47.1, 9.1, 47.9), outer)).toBe(false)
    expect(envelopeContains(bounds(8.1, 47.1, 8.9, 48.1), outer)).toBe(false)
  })
})

describe('resolveViewportEnvelope', () => {
  const zurich = bounds(8.5, 47.3, 8.6, 47.4)

  it('emits the padded envelope when none was emitted yet', () => {
    expect(resolveViewportEnvelope(zurich, null)).toEqual(padBounds(zurich))
  })

  it('keeps the emitted envelope while the viewport stays inside it', () => {
    const emitted = padBounds(zurich)
    // a small pan stays within the padded window
    expect(
      resolveViewportEnvelope(bounds(8.51, 47.31, 8.61, 47.41), emitted),
    ).toBeNull()
    // zooming in shrinks the viewport — still inside
    expect(
      resolveViewportEnvelope(bounds(8.53, 47.33, 8.57, 47.37), emitted),
    ).toBeNull()
  })

  it('emits a new envelope once the viewport leaves the window', () => {
    const emitted = padBounds(zurich)
    const panned = bounds(8.7, 47.3, 8.8, 47.4)
    expect(resolveViewportEnvelope(panned, emitted)).toEqual(padBounds(panned))
    // zooming out grows beyond the window too
    const zoomedOut = bounds(8.2, 47.1, 8.9, 47.6)
    expect(resolveViewportEnvelope(zoomedOut, emitted)).toEqual(
      padBounds(zoomedOut),
    )
  })
})

describe('viewport SQL helpers', () => {
  it('predicate disables on NULL and compares bbox on $2..$5', () => {
    expect(viewportPredicate('o.geometry')).toBe(
      ' AND ($2::float8 IS NULL OR o.geometry && ST_MakeEnvelope($2::float8, $3::float8, $4::float8, $5::float8, 4326))',
    )
  })

  it('either predicate checks both endpoints for assignment lines', () => {
    expect(viewportEitherPredicate('o.geometry', 'p.geometry')).toBe(
      ' AND ($2::float8 IS NULL OR o.geometry && ST_MakeEnvelope($2::float8, $3::float8, $4::float8, $5::float8, 4326) OR p.geometry && ST_MakeEnvelope($2::float8, $3::float8, $4::float8, $5::float8, 4326))',
    )
  })

  it('params map the envelope, null when unset', () => {
    expect(viewportParams(null)).toEqual([null, null, null, null])
    expect(viewportParams(bounds(1, 2, 3, 4))).toEqual([1, 2, 3, 4])
  })
})
