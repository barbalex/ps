import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Circle, CircleMarker, useMap } from 'react-leaflet'
import { DomEvent, LatLng } from 'leaflet'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
import proj4 from 'proj4'

import { useMapCoordinatesCrs } from '../../../modules/useMapCoordinatesCrs.ts'
import { averageGpsFixes, GPS_FIX_COUNT } from './averageGpsFixes.ts'
import styles from './PrecisePoint.module.css'

const { Button, Field, Input } = fluentUiReactComponents

type Props = {
  apply: (position: LatLng, accuracy?: number | null) => Promise<void>
  savedAccuracy: number | null
}

export const PrecisePoint = (props: Props) => {
  const crs = useMapCoordinatesCrs()
  return (
    crs && (
      <PointPanel
        key={`${crs.code}:${crs.projection}`}
        {...props}
        {...crs}
      />
    )
  )
}

const PointPanel = ({
  apply,
  savedAccuracy,
  code,
  projection,
}: Props & { code: string; projection: string | null }) => {
  const map = useMap()
  const { formatMessage } = useIntl()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [preview, setPreview] = useState<LatLng | null>(null)
  const [saving, setSaving] = useState(false)
  const [gpsState, setGpsState] = useState<
    'idle' | 'pending' | 'failed' | number
  >('idle')
  const [averageCount, setAverageCount] = useState<number | null>(null)
  const gpsRequest = useRef<AbortController | null>(null)
  const [error, setError] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = ref.current!
    DomEvent.disableClickPropagation(element)
    DomEvent.disableScrollPropagation(element)
    return () => {
      gpsRequest.current?.abort()
    }
  }, [])

  const reset = () => {
    gpsRequest.current?.abort()
    setAverageCount(null)
    setGpsState('idle')
    setOpen(false)
    setInput('')
    setPreview(null)
    setError('')
  }
  const capture = (average: boolean) => {
    gpsRequest.current?.abort()
    const request = new AbortController()
    gpsRequest.current = request
    setAverageCount(average ? 0 : null)
    setInput('')
    setPreview(null)
    setError('')
    setGpsState('pending')
    const fail = (message: string) => {
      if (request.signal.aborted) return
      request.abort()
      setAverageCount(null)
      setGpsState('failed')
      setError(message)
    }
    const noFix = formatMessage({
      id: 'gpsNoFix',
      defaultMessage: 'Keine Position mit gültiger Genauigkeit verfügbar.',
    })
    if (!navigator.geolocation) return fail(noFix)
    const fixes: { position: LatLng; accuracy: number }[] = []
    const started = Date.now()
    let latest = started - 1
    let next: number
    if (average) {
      const deadline = window.setTimeout(
        () =>
          fail(
            formatMessage({
              id: 'gpsAverageTimeout',
              defaultMessage:
                'Nicht genügend aktuelle Positionen erhalten. Bitte erneut versuchen.',
            }),
          ),
        60000,
      )
      request.signal.addEventListener(
        'abort',
        () => {
          window.clearTimeout(deadline)
          window.clearTimeout(next)
        },
        { once: true },
      )
    }
    const read = () =>
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude, accuracy }, timestamp }) => {
          if (request.signal.aborted) return
          if (
            ![latitude, longitude, accuracy].every(Number.isFinite) ||
            Math.abs(latitude) > 90 ||
            Math.abs(longitude) > 180 ||
            accuracy < 0
          )
            return fail(noFix)
          let fix = { position: new LatLng(latitude, longitude), accuracy }
          if (average) {
            if (timestamp > latest) {
              latest = timestamp
              fixes.push(fix)
              setAverageCount(fixes.length)
            }
            if (fixes.length < GPS_FIX_COUNT) {
              next = window.setTimeout(read, 1000)
              return
            }
            fix = averageGpsFixes(fixes)
          }
          request.abort()
          setPreview(fix.position)
          setGpsState(fix.accuracy)
          map.setView(fix.position, map.getZoom(), { animate: false })
        },
        (cause) => fail(cause.message || noFix),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
      )
    read()
  }
  const cannotApply =
    saving ||
    gpsState === 'pending' ||
    gpsState === 'failed' ||
    (!!input.trim() && !preview)
  const showPreview = () => {
    const pair = input
      .trim()
      .replace(/['’]/g, '')
      .match(/^([+-]?\d+(?:\.\d+)?)\s*(?:[,;/]|\s)\s*([+-]?\d+(?:\.\d+)?)$/)
    const invalid = () =>
      setError(
        formatMessage(
          {
            id: 'precisePointInvalid',
            defaultMessage:
              'Ungültige Koordinaten für {crs}. Reihenfolge: X / Y.',
          },
          { crs: code },
        ),
      )
    if (!pair) return invalid()
    const xy: [number, number] = [Number(pair[1]), Number(pair[2])]
    if (
      code === 'EPSG:2056' &&
      !(xy[0] >= 2e6 && xy[0] < 3e6 && xy[1] >= 1e6 && xy[1] < 2e6)
    )
      return invalid()
    let position: LatLng
    try {
      const [lng, lat] = projection ? proj4(projection, 'EPSG:4326', xy) : xy
      if (
        !Number.isFinite(lng) ||
        !Number.isFinite(lat) ||
        Math.abs(lng) > 180 ||
        Math.abs(lat) > 90
      )
        return invalid()
      position = new LatLng(lat, lng)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
      return
    }
    setPreview(position)
    setError('')
    map.setView(position, map.getZoom(), { animate: false })
  }
  const save = async () => {
    if (cannotApply) return
    setSaving(true)
    try {
      await apply(
        preview ?? map.getCenter().wrap(),
        typeof gpsState === 'number' ? gpsState : null,
      )
      reset()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div
        ref={ref}
        className={styles.control}
        onKeyDown={(event) => event.stopPropagation()}
      >
        {!open ?
          <button
            type="button"
            onClick={() => setOpen(true)}
          >
            {formatMessage({
              id: 'precisePoint',
              defaultMessage: 'Punkt genau platzieren',
            })}
          </button>
        : <>
            <Field
              label={formatMessage(
                {
                  id: 'precisePointHint',
                  defaultMessage:
                    'Karte unter das Fadenkreuz schieben oder Koordinaten eingeben ({crs}, X / Y):',
                },
                { crs: code },
              )}
              validationMessage={error || undefined}
              validationState={error ? 'error' : 'none'}
            >
              <Input
                value={input}
                disabled={saving}
                placeholder={
                  code === 'EPSG:2056' ? '2600000 / 1200000'
                  : code === 'EPSG:4326' ?
                    '8.54 / 47.37'
                  : 'X / Y'
                }
                onChange={(event) => {
                  gpsRequest.current?.abort()
                  setAverageCount(null)
                  setGpsState('idle')
                  setInput(event.target.value)
                  setPreview(null)
                  setError('')
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && input.trim()) showPreview()
                }}
              />
            </Field>
            <div role="status">
              {gpsState === 'pending' &&
                averageCount !== null &&
                formatMessage(
                  {
                    id: 'gpsAverageProgress',
                    defaultMessage:
                      'Stillstehen: {count} von {total} GPS-Positionen erfasst.',
                  },
                  { count: averageCount, total: GPS_FIX_COUNT },
                )}
              {gpsState === 'pending' &&
                averageCount === null &&
                formatMessage({
                  id: 'gpsWaiting',
                  defaultMessage: 'Position wird ermittelt…',
                })}
              {typeof gpsState === 'number' &&
                averageCount !== null &&
                formatMessage(
                  {
                    id: 'gpsAverageRadius',
                    defaultMessage:
                      'Mittelwert aus {count} Positionen. Radius einschliesslich aller Genauigkeitskreise: {meters, number} m',
                  },
                  { count: averageCount, meters: gpsState },
                )}
              {typeof gpsState === 'number' &&
                averageCount === null &&
                formatMessage(
                  {
                    id: 'gpsAccuracy',
                    defaultMessage:
                      'Horizontale Genauigkeit: ±{meters, number} m',
                  },
                  { meters: gpsState },
                )}
              {gpsState === 'idle' &&
                savedAccuracy !== null &&
                formatMessage(
                  {
                    id: 'gpsSavedAccuracy',
                    defaultMessage:
                      'Gespeicherte GPS-Genauigkeit: ±{meters, number} m',
                  },
                  { meters: savedAccuracy },
                )}
            </div>
            <div className={styles.actions}>
              <Button
                type="button"
                disabled={saving || gpsState === 'pending'}
                onClick={() => capture(false)}
              >
                {formatMessage({
                  id: 'gpsUseLocation',
                  defaultMessage: 'GPS-Position erfassen',
                })}
              </Button>
              <Button
                type="button"
                disabled={saving || gpsState === 'pending'}
                onClick={() => capture(true)}
              >
                {formatMessage(
                  {
                    id: 'gpsAverage',
                    defaultMessage: '{count} GPS-Positionen mitteln',
                  },
                  { count: GPS_FIX_COUNT },
                )}
              </Button>
              {!!input.trim() && (
                <Button
                  type="button"
                  disabled={saving}
                  onClick={showPreview}
                >
                  {formatMessage({
                    id: 'precisePointPreview',
                    defaultMessage: 'Vorschau',
                  })}
                </Button>
              )}
              <Button
                appearance="primary"
                type="button"
                disabled={cannotApply}
                onClick={save}
              >
                {formatMessage({
                  id: 'precisePointApply',
                  defaultMessage: 'Punkt übernehmen',
                })}
              </Button>
              <Button
                type="button"
                disabled={saving}
                onClick={reset}
              >
                {formatMessage({ id: 'cancel', defaultMessage: 'Abbrechen' })}
              </Button>
            </div>
          </>
        }
      </div>
      {open &&
        gpsState === 'idle' &&
        !input.trim() &&
        createPortal(
          <span
            aria-hidden="true"
            className={styles.crosshair}
          >
            +
          </span>,
          map.getContainer(),
        )}
      {preview && typeof gpsState === 'number' && (
        <Circle
          center={preview}
          radius={gpsState}
          interactive={false}
          geomanIgnore
          pathOptions={{ color: '#125daa', weight: 1, fillOpacity: 0.1 }}
        />
      )}
      {preview && (
        <CircleMarker
          center={preview}
          radius={7}
          interactive={false}
          geomanIgnore
          pathOptions={{
            color: '#125daa',
            fillOpacity: 0.35,
            dashArray: '3 2',
          }}
        />
      )}
    </>
  )
}
