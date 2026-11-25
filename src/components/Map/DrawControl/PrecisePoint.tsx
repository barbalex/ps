import { useEffect, useRef, useState } from 'react'
import { CircleMarker, useMap } from 'react-leaflet'
import { DomEvent, LatLng } from 'leaflet'
import { useIntl } from 'react-intl'
import proj4 from 'proj4'

import { useMapCoordinatesCrs } from '../../../modules/useMapCoordinatesCrs.ts'
import styles from './PrecisePoint.module.css'

type Props = { apply: (position: LatLng) => Promise<void> }

export const PrecisePoint = ({ apply }: Props) => {
  const crs = useMapCoordinatesCrs()
  return (
    crs && (
      <PointPanel
        key={`${crs.code}:${crs.projection}`}
        apply={apply}
        {...crs}
      />
    )
  )
}

const PointPanel = ({
  apply,
  code,
  projection,
}: Props & { code: string; projection: string | null }) => {
  const map = useMap()
  const { formatMessage } = useIntl()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [preview, setPreview] = useState<LatLng | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = ref.current!
    DomEvent.disableClickPropagation(element)
    DomEvent.disableScrollPropagation(element)
  }, [])

  const reset = () => {
    setOpen(false)
    setInput('')
    setPreview(null)
    setError('')
  }
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
    if (saving || (input.trim() && !preview)) return
    setSaving(true)
    try {
      await apply(preview ?? map.getCenter().wrap())
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
            <label>
              {formatMessage(
                {
                  id: 'precisePointHint',
                  defaultMessage:
                    'Karte unter das Fadenkreuz schieben oder Koordinaten eingeben ({crs}, X / Y):',
                },
                { crs: code },
              )}
              <input
                value={input}
                disabled={saving}
                placeholder={
                  code === 'EPSG:2056' ? '2600000 / 1200000'
                  : code === 'EPSG:4326' ?
                    '8.54 / 47.37'
                  : 'X / Y'
                }
                onChange={(event) => {
                  setInput(event.target.value)
                  setPreview(null)
                  setError('')
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && input.trim()) showPreview()
                }}
              />
            </label>
            {error && <div role="alert">{error}</div>}
            <div className={styles.actions}>
              {!!input.trim() && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={showPreview}
                >
                  {formatMessage({
                    id: 'precisePointPreview',
                    defaultMessage: 'Vorschau',
                  })}
                </button>
              )}
              <button
                type="button"
                disabled={saving || (!!input.trim() && !preview)}
                onClick={save}
              >
                {formatMessage({
                  id: 'precisePointApply',
                  defaultMessage: 'Punkt übernehmen',
                })}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={reset}
              >
                {formatMessage({ id: 'cancel', defaultMessage: 'Abbrechen' })}
              </button>
            </div>
          </>
        }
      </div>
      {open && !input.trim() && (
        <span
          aria-hidden="true"
          className={styles.crosshair}
        >
          +
        </span>
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
