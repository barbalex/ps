import { useEffect, useRef, useState } from 'react'
import { Button, Checkbox } from '@fluentui/react-components'
import { usePGlite } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'
import { LatLng } from 'leaflet'
import { CircleMarker, Polygon, Polyline, useMap } from 'react-leaflet'

import styles from './PrecisePoint.module.css'
import {
  previewPolygonEdit,
  type PolygonAction,
  type PolygonTarget,
  type PolygonResult,
} from '../../../modules/walkPolygonEdit.ts'

type Part = LatLng[]
type Mode = 'line' | 'polygon'
const latLngs = (coords: GeoJSON.Position[]) =>
  coords.map(([lng, lat]) => new LatLng(lat, lng))
export type TrackGeometry = GeoJSON.LineString | GeoJSON.Polygon
export type DrawTrack = (
  receive: (points: Part) => void,
  end: () => void,
) => () => void
const options = {
  geomanIgnore: true,
  snapIgnore: true,
  interactive: false,
  color: '#007d84',
  dashArray: '6 4',
}

export const WalkTrack = ({
  apply,
  drawTrack,
  targets,
  close,
  polygonsOnly = false,
}: {
  targets: PolygonTarget[]
  polygonsOnly?: boolean
  drawTrack?: DrawTrack
  apply: (parts: TrackGeometry[], target?: PolygonTarget) => Promise<void>
  close: () => void
}) => {
  const { formatMessage: msg } = useIntl()
  const map = useMap()
  const db = usePGlite()
  const [action, setAction] = useState<Mode | PolygonAction>(
    polygonsOnly ? 'polygon' : 'line',
  )
  const mode: Mode =
    action === 'polygon' || action === 'hole' ? 'polygon' : 'line'
  const editing = action !== 'line' && action !== 'polygon'
  const [targetId, setTargetId] = useState(targets.length === 1 ? 0 : -1)
  const target = targets[targetId]
  const [otherArc, setOtherArc] = useState(false)
  const [result, setResult] = useState<PolygonResult | null>(null)
  const [parts, setParts] = useState<Part[]>([])
  const [drawing, setDrawing] = useState(!!drawTrack)
  useEffect(() => {
    if (drawTrack && drawing)
      return drawTrack(
        (points) => setParts([points]),
        () => setDrawing(false),
      )
  }, [drawTrack, drawing])
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
  const hint =
    action === 'hole' ?
      msg({
        id: 'walkHoleHint',
        defaultMessage:
          'Ein geschlossener Abschnitt muss vollständig innerhalb des Zielpolygons liegen.',
      })
    : action === 'reshape' ?
      msg({
        id: 'walkReshapeHint',
        defaultMessage:
          'Ein Abschnitt mit zwei Enden innerhalb von 5 m vom Aussenrand. Der rote Rand wird ersetzt.',
      })
    : action === 'split' ?
      msg({
        id: 'walkSplitHint',
        defaultMessage:
          'Ein durchgehender Abschnitt muss das Zielpolygon vollständig durchqueren.',
      })
    : ''
  useEffect(() => {
    setReview(null)
    setResult(null)
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
      .then(async ({ rows }) => {
        if (!active) return
        if (rows.some((row) => !row.valid)) {
          setReviewError(invalid)
          return
        }
        const shapes = rows.map((row) => row.shape)
        if (action !== 'line' && action !== 'polygon') {
          if (!target) return
          const edited =
            shapes.length === 1 ?
              await previewPolygonEdit(
                db,
                action,
                target.polygon,
                shapes[0],
                otherArc,
              )
            : null
          if (!active) return
          if (!edited) {
            setReviewError(hint)
            return
          }
          setResult(edited)
        }
        setReview(shapes)
      })
      .catch((cause) => {
        if (active) setReviewError(String(cause))
      })
    return () => {
      active = false
    }
  }, [
    action,
    db,
    enough,
    hint,
    invalid,
    mode,
    otherArc,
    parts,
    recording,
    simplify,
    target,
  ])
  const save = async () => {
    if (!review || recording || saving) return
    setSaving(true)
    try {
      await apply(result?.shapes ?? review, editing ? target : undefined)
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
        {!recording &&
          (!drawTrack || parts.length > 0) &&
          (
            [
              ...(polygonsOnly ? [] : (['line'] as const)),
              'polygon',
              ...(parts.length && targets.length ?
                (['hole', 'reshape', 'split'] as const)
              : []),
            ] as const
          ).map((type) => (
            <Button
              key={type}
              size="small"
              disabled={saving}
              aria-pressed={action === type}
              appearance={action === type ? 'primary' : 'secondary'}
              onClick={() => {
                if (type !== action) {
                  setReview(null)
                  setResult(null)
                  setAction(type)
                }
              }}
            >
              {type === 'hole' ?
                msg({ id: 'walkHole', defaultMessage: 'Loch ausschneiden' })
              : type === 'reshape' ?
                msg({ id: 'walkReshape', defaultMessage: 'Rand ersetzen' })
              : type === 'split' ?
                msg({ id: 'walkSplit', defaultMessage: 'Polygon teilen' })
              : parts.length && type === 'line' ?
                msg({
                  id: 'walkAsLine',
                  defaultMessage: 'Als Linie hinzufügen',
                })
              : parts.length ?
                msg({
                  id: 'walkAsPolygon',
                  defaultMessage: 'Als Polygon hinzufügen',
                })
              : type === 'line' ?
                msg({ id: 'walkTransect', defaultMessage: 'Transekt' })
              : msg({ id: 'walkPerimeter', defaultMessage: 'Umriss' })}
            </Button>
          ))}
      </div>
      {editing && !recording && (
        <>
          <label>
            {msg({ id: 'walkTarget', defaultMessage: 'Zielpolygon' })}{' '}
            <select
              value={targetId}
              disabled={saving}
              onChange={(e) => {
                setReview(null)
                setResult(null)
                setTargetId(Number(e.target.value))
              }}
            >
              <option value={-1}>—</option>
              {targets.map((_, i) => (
                <option
                  key={i}
                  value={i}
                >
                  {i + 1}
                </option>
              ))}
            </select>
          </label>
          {!reviewError && <div>{hint}</div>}
          {action === 'reshape' && (
            <Checkbox
              disabled={saving}
              checked={otherArc}
              label={msg({
                id: 'walkOtherArc',
                defaultMessage: 'Anderen Randabschnitt ersetzen',
              })}
              onChange={(_, data) => {
                setReview(null)
                setResult(null)
                setOtherArc(data.checked === true)
              }}
            />
          )}
        </>
      )}
      <div role="status">
        {drawing ?
          msg({
            id: 'walkDrawHint',
            defaultMessage:
              'Eckpunkte auf der Karte antippen. Zum Abschliessen den letzten Punkt erneut antippen.',
          })
        : msg(
            {
              id: 'walkProgress',
              defaultMessage:
                '{count, plural, one {# Punkt} other {# Punkte}} in {parts, plural, one {# Abschnitt} other {# Abschnitten}}',
            },
            {
              count: preview.reduce((n, part) => n + part.length, 0),
              parts: parts.length,
            },
          )
        }
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
        {drawTrack ?
          !drawing && (
            <Button
              disabled={saving}
              onClick={() => {
                setParts([])
                setReview(null)
                setResult(null)
                setError('')
                setDrawing(true)
              }}
            >
              {msg({ id: 'walkDraw', defaultMessage: 'Spur zeichnen' })}
            </Button>
          )
        : resumeChoice ?
          <>
            <Button onClick={() => start(false)}>
              {msg({
                id: 'walkConnect',
                defaultMessage: 'Mit letztem Punkt verbinden',
              })}
            </Button>
            <Button
              disabled={!review || editing}
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
      {editing && target && !recording && (
        <Polygon
          positions={target.polygon.coordinates.map(latLngs)}
          {...options}
          color="#7e57c2"
          fill={false}
        />
      )}
      {result?.shapes.map((g, i) => (
        <Polygon
          key={i}
          positions={g.coordinates.map(latLngs)}
          {...options}
          dashArray=""
          fillOpacity={0.25}
        />
      ))}
      {result?.removed && (
        <>
          <Polyline
            positions={latLngs(result.removed.coordinates)}
            {...options}
            color="#bc3a26"
            weight={4}
          />
          {[
            result.removed.coordinates[0],
            result.removed.coordinates.at(-1)!,
          ].map(([lng, lat], i) => (
            <CircleMarker
              key={i}
              center={[lat, lng]}
              radius={5}
              {...options}
              color="#bc3a26"
            />
          ))}
        </>
      )}
      {!result &&
        preview.map((part, i) =>
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
