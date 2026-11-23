import { useEffect, useRef, useState } from 'react'
import { useAtomValue } from 'jotai'
import { useDebouncedCallback } from 'use-debounce'

import { mapViewportBoundsAtom, type ViewportBounds } from '../../../store.ts'

/** How far the query envelope extends beyond the viewport, per axis. */
export const VIEWPORT_PAD_FACTOR = 0.5

/** Debounce for envelope updates after moveend/zoomend — rapid zooming must
 * not re-run every table layer's live query per zoom step. */
export const VIEWPORT_ENVELOPE_DEBOUNCE_MS = 400

/** Pads bounds per axis, clamped to the world. */
export const padBounds = (
  bounds: ViewportBounds,
  factor = VIEWPORT_PAD_FACTOR,
): ViewportBounds => {
  const padLng = (bounds.neLng - bounds.swLng) * factor
  const padLat = (bounds.neLat - bounds.swLat) * factor
  return {
    swLng: Math.max(bounds.swLng - padLng, -180),
    swLat: Math.max(bounds.swLat - padLat, -90),
    neLng: Math.min(bounds.neLng + padLng, 180),
    neLat: Math.min(bounds.neLat + padLat, 90),
  }
}

/** Whether inner lies completely inside outer (inclusive edges). */
export const envelopeContains = (
  inner: ViewportBounds,
  outer: ViewportBounds,
): boolean =>
  inner.swLng >= outer.swLng &&
  inner.swLat >= outer.swLat &&
  inner.neLng <= outer.neLng &&
  inner.neLat <= outer.neLat

/**
 * The next query envelope for new map bounds, or null to keep the current
 * one: while the raw viewport still lies inside the last emitted padded
 * envelope, small pans and zoom-ins keep their loaded features instead of
 * re-querying (the WFS layer's fetch-window skip, applied to live queries).
 */
export const resolveViewportEnvelope = (
  raw: ViewportBounds,
  emitted: ViewportBounds | null,
): ViewportBounds | null =>
  emitted && envelopeContains(raw, emitted) ? null : padBounds(raw)

/**
 * Padded query envelope of the current viewport for the table layers' live
 * queries — the atom BoundsListener writes on moveend/zoomend. The first
 * bounds emit immediately (boot queries must not run unfiltered longer than
 * necessary); later changes are debounced and skipped while the viewport
 * stays inside the emitted window. useLiveQuery keeps the previous rows
 * until the re-queried ones arrive, so there is no blank flash between
 * envelopes.
 */
export const useViewportEnvelope = (): ViewportBounds | null => {
  const bounds = useAtomValue(mapViewportBoundsAtom)
  const [envelope, setEnvelope] = useState<ViewportBounds | null>(null)
  const emittedRef = useRef<ViewportBounds | null>(null)

  const emitDebounced = useDebouncedCallback((raw: ViewportBounds) => {
    const next = resolveViewportEnvelope(raw, emittedRef.current)
    if (next) {
      emittedRef.current = next
      setEnvelope(next)
    }
  }, VIEWPORT_ENVELOPE_DEBOUNCE_MS)

  useEffect(() => {
    if (!bounds) return
    if (!emittedRef.current) {
      const first = padBounds(bounds)
      emittedRef.current = first
      setEnvelope(first)
      return
    }
    emitDebounced(bounds)
  }, [bounds, emitDebounced])

  return envelope
}

// The envelope for the viewport predicates: $2..$5 bind swLng, swLat, neLng,
// neLat ($1 stays the subproject id). All NULL disables the filter — the
// brief window before the first bounds arrive behaves like the former
// unfiltered queries. && compares bounding boxes and is served by the
// geometry columns' GiST indexes, like the prefilter in nearestPlaces.
const ENVELOPE_SQL =
  'ST_MakeEnvelope($2::float8, $3::float8, $4::float8, $5::float8, 4326)'

export const viewportPredicate = (geometryExpr: string): string =>
  ` AND ($2::float8 IS NULL OR ${geometryExpr} && ${ENVELOPE_SQL})`

/**
 * Viewport predicate when a row's geometry comes from two joined tables
 * (assignment lines): the line is loaded when either endpoint's geometry
 * intersects the envelope. Lines crossing the viewport with BOTH endpoints
 * far outside are culled — acceptable for the short lines of nearby
 * assignments, and it keeps both checks on the GiST indexes.
 */
export const viewportEitherPredicate = (
  geometryExprA: string,
  geometryExprB: string,
): string =>
  ` AND ($2::float8 IS NULL OR ${geometryExprA} && ${ENVELOPE_SQL} OR ${geometryExprB} && ${ENVELOPE_SQL})`

export const viewportParams = (
  envelope: ViewportBounds | null,
): [number | null, number | null, number | null, number | null] => [
  envelope?.swLng ?? null,
  envelope?.swLat ?? null,
  envelope?.neLng ?? null,
  envelope?.neLat ?? null,
]
