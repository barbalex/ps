import { useEffect, useRef, useState } from 'react'
import { Button, Checkbox } from '@fluentui/react-components'
import { usePGlite } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'
import { LatLng } from 'leaflet'
import { CircleMarker, Polygon, Polyline, useMap } from 'react-leaflet'

import styles from './PrecisePoint.module.css'

type Part = LatLng[]
type Mode = 'line' | 'polygon'
export type TrackGeometry = GeoJSON.LineString | GeoJSON.Polygon
const options = {
  geomanIgnore: true,
  snapIgnore: true,
  interactive: false,
  color: '#007d84',
  dashArray: '6 4',
}

export const WalkTrack = ({
  apply,
  close,
}: {
  apply: (parts: TrackGeometry[]) => Promise<void>
  close: () => void
}) => {
  const { formatMessage: msg } = useIntl()
  const map = useMap()
  const db = usePGlite()
  const [mode, setMode] = useState<Mode>('line')
  const [parts, setParts] = useState<Part[]>([])
  const [recording, setRecording] = useState(false)
  const [resumeChoice, setResumeChoice] = useState(false)
  const [simplify, setSimplify] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [review, setReview] = useState<TrackGeometry[] | null>(null)
  const watch = useRef<number | null>(null)
  const session = useRef<symbol | null>(null)
  const lastTime = useRef(-Infinity)
  const pause = () => {
    session.current = null
    if (watch.current !== null) navigator.geolocation.clearWatch(watch.current)
    watch.current = null
    setRecording(false)
  }
  useEffect(() => {
    const hide = () => {
      if (document.hidden) pause()
    }
    document.addEventListener('visibilitychange', hide)
    return () => {
      document.removeEventListener('visibilitychange', hide)
      session.current = null
      if (watch.current !== null)
        navigator.geolocation.clearWatch(watch.current)
    }
  }, [])
  const start = (separate: boolean) => {
    setResumeChoice(false)
    setError('')
    const noFix = msg({
      id: 'gpsNoFix',
      defaultMessage: 'Keine Position mit gültiger Genauigkeit verfügbar.',
    })
    if (!navigator.geolocation) {
      setError(noFix)
      return
    }
    setReview(null)
    setRecording(true)
    const token = Symbol()
    session.current = token
    let first = true
    const fail = (message: string) => {
      if (session.current !== token) return
      pause()
      setError(message)
    }
    watch.current = navigator.geolocation.watchPosition(
      ({ coords, timestamp }) => {
        if (session.current !== token || timestamp <= lastTime.current) return
        const { latitude, longitude } = coords
        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude) ||
          Math.abs(latitude) > 90 ||
          Math.abs(longitude) > 180
        )
          return fail(noFix)
        lastTime.current = timestamp
        const point = new LatLng(latitude, longitude)
        const newPart = separate && first
        if (first || !map.getBounds().contains(point))
          map.panTo(point, { animate: false })
        first = false
        setParts((previous) => {
          const current = previous.at(-1)
          if (!current || newPart) return [...previous, [point]]
          if (current.at(-1)?.equals(point, 0)) return previous
          return [...previous.slice(0, -1), [...current, point]]
        })
      },
      (cause) => fail(cause.message || noFix),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
    )
  }
  const enough =
    parts.length > 0 &&
    parts.every(
      (part) =>
        part.length >=
        (mode === 'line' ? 2
        : part[0].equals(part.at(-1)!, 0) ? 4
        : 3),
    )
  const invalid = msg({
    id: 'walkInvalid',
    defaultMessage:
      'Jeder Abschnitt braucht eine gültige Linie oder ein gültiges Polygon.',
  })
  const [reviewError, setReviewError] = useState('')
  useEffect(() => {
    setReview(null)
    setReviewError('')
    if (recording || !enough) return
    let active = true
    const geometries: TrackGeometry[] = parts.map((part) => {
      const coords = part.map((p) => [p.lng, p.lat])
      return mode === 'line' ?
          { type: 'LineString', coordinates: coords }
        : {
            type: 'Polygon',
            coordinates: [
              part[0].equals(part.at(-1)!, 0) ? coords : [...coords, coords[0]],
            ],
          }
    })
    // Simplify in a local metric projection, preserving polygon topology.
    // Keep the original coordinates untouched unless simplification is requested.
    db.query<{ shape: TrackGeometry; valid: boolean }>(
      `
      WITH parts AS (SELECT ord, ST_GeomFromGeoJSON(value::text) AS g
        FROM jsonb_array_elements($1::jsonb) WITH ORDINALITY AS p(value, ord)),
      projected AS (SELECT *, CASE WHEN ST_Y(ST_PointOnSurface(g)) >= 0 THEN 32600 ELSE 32700 END
        + LEAST(60, 1 + floor((ST_X(ST_PointOnSurface(g)) + 180) / 6)::int) AS srid FROM parts),
      preview AS (SELECT ord, ST_IsValid(g) AS valid, CASE WHEN $2 AND ST_IsValid(g)
        THEN ST_Transform(ST_SimplifyPreserveTopology(ST_Transform(g, srid), 1), 4326)
        ELSE g END AS shape FROM projected)
      SELECT ST_AsGeoJSON(shape, 17)::json AS shape, valid AND ST_IsValid(shape) AS valid FROM preview ORDER BY ord`,
      [JSON.stringify(geometries), simplify],
    )
      .then(({ rows }) => {
        if (!active) return
        if (rows.some((row) => !row.valid)) setReviewError(invalid)
        else setReview(rows.map((row) => row.shape))
      })
      .catch((cause) => {
        if (active) setReviewError(String(cause))
      })
    return () => {
      active = false
    }
  }, [db, enough, invalid, mode, parts, recording, simplify])
  const save = async () => {
    if (!review || recording || saving) return
    setSaving(true)
    try {
      await apply(review)
      close()
    } catch (cause) {
      setError(String(cause))
      setSaving(false)
    }
  }
  const preview =
    review ?
      review.map((g) =>
        (g.type === 'Polygon' ?
          g.coordinates[0].slice(0, -1)
        : g.coordinates
        ).map(([lng, lat]) => new LatLng(lat, lng)),
      )
    : parts
  return (
    <>
      <div className={styles.actions}>
        {!parts.length &&
          !recording &&
          (['line', 'polygon'] as const).map((type) => (
            <Button
              key={type}
              size="small"
              aria-pressed={mode === type}
              appearance={mode === type ? 'primary' : 'secondary'}
              onClick={() => setMode(type)}
            >
              {type === 'line' ?
                msg({ id: 'walkTransect', defaultMessage: 'Transekt' })
              : msg({ id: 'walkPerimeter', defaultMessage: 'Umriss' })}
            </Button>
          ))}
      </div>
      <div role="status">
        {msg(
          {
            id: 'walkProgress',
            defaultMessage: '{count, plural, one {# Punkt} other {# Punkte}} in {parts, plural, one {# Abschnitt} other {# Abschnitten}}',
          },
          {
            count: preview.reduce((n, part) => n + part.length, 0),
            parts: parts.length,
          },
        )}
      </div>
      {(error || reviewError) && <div role="alert">{error || reviewError}</div>}
      {!recording && !!parts.length && !enough && <div>{invalid}</div>}
      {!recording && enough && (
        <Checkbox
          disabled={saving}
          checked={simplify}
          onChange={(_, data) => {
            setReview(null)
            setSimplify(data.checked === true)
          }}
          label={msg({
            id: 'walkSimplify',
            defaultMessage: 'Vereinfachen (1 m Toleranz)',
          })}
        />
      )}
      <div className={styles.actions}>
        {resumeChoice ?
          <>
            <Button onClick={() => start(false)}>
              {msg({
                id: 'walkConnect',
                defaultMessage: 'Mit letztem Punkt verbinden',
              })}
            </Button>
            <Button
              disabled={!review}
              onClick={() => start(true)}
            >
              {msg({ id: 'walkSeparate', defaultMessage: 'Neuer Abschnitt' })}
            </Button>
          </>
        : <Button
            disabled={saving}
            onClick={() =>
              recording ? pause()
              : parts.length ? setResumeChoice(true)
              : start(true)
            }
          >
            {recording ?
              msg({ id: 'walkPause', defaultMessage: 'Aufnahme pausieren' })
            : parts.length ?
              msg({ id: 'walkResume', defaultMessage: 'Aufnahme fortsetzen' })
            : msg({ id: 'walkStart', defaultMessage: 'GPS-Aufnahme starten' })}
          </Button>
        }
        <Button
          appearance="primary"
          disabled={!review || recording || saving}
          onClick={save}
        >
          {msg({ id: 'walkSave', defaultMessage: 'Spur speichern' })}
        </Button>
        <Button
          disabled={saving}
          onClick={close}
        >
          {msg({ id: 'cancel', defaultMessage: 'Abbrechen' })}
        </Button>
      </div>
      {preview.map((part, i) =>
        part.length === 1 ?
          <CircleMarker
            key={i}
            center={part[0]}
            radius={5}
            {...options}
          />
        : mode === 'polygon' && part.length >= 3 ?
          <Polygon
            key={i}
            positions={part}
            {...options}
          />
        : <Polyline
            key={i}
            positions={part}
            {...options}
          />,
      )}
    </>
  )
}
