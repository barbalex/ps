import { useCallback, useEffect, useRef, useState } from 'react'
import type { ComponentProps, FC } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { ToolbarButton } = fluentUiReactComponents
import { useMap } from 'react-leaflet'
import { CircleMarker, DomEvent, LayerGroup, Polyline } from 'leaflet'
import { MdStraighten } from 'react-icons/md'
import { length as turfLength } from '@turf/length'
import { area as turfArea } from '@turf/area'
import { lineString, polygon as turfPolygon } from '@turf/helpers'
import { useIntl } from 'react-intl'
import type { LatLng, LeafletMouseEvent } from 'leaflet'
import type { Feature, LineString, Polygon as PolygonGeometry } from 'geojson'

import styles from './index.module.css'

// Ported from apf2, where it was the first-party replacement for
// leaflet-measure (unmaintained since 2018, Leaflet-1-only). Measures
// distances and — with three or more points — the enclosed area, like the
// old control did. One measurement per activation: the mode ends when a
// measurement is completed (double click); to measure again, the button
// is clicked again. A completed measurement is removed with the remove
// icon in its tooltip or by starting the next measurement.
const ACTIVE_COLOR = '#f45942'
const COMPLETED_COLOR = '#b22c25'

// toggled on the map container while measuring so ClickListener can
// ignore map clicks (see geoman-active for the same pattern)
const MEASURE_ACTIVE_CLASS = 'measure-active'

// vertices closer than this (pixels) are treated as one: the two clicks
// preceding a double click land on (nearly) the same spot
const VERTEX_MERGE_DISTANCE_PX = 6

// the app formats numbers Swiss-style everywhere (see formatNumber)
const formatLength = (meters: number) => {
  if (meters < 1000) return `${meters.toLocaleString('de-CH')} m`
  const km = meters / 1000
  return `${km.toLocaleString('de-CH', { maximumFractionDigits: 2 })} km`
}

const formatArea = (squareMeters: number) => {
  const base = `${Math.round(squareMeters).toLocaleString('de-CH')} m²`
  if (squareMeters < 10_000) return base
  const ha = squareMeters / 10_000
  return `${base} (${ha.toLocaleString('de-CH', { maximumFractionDigits: 2 })} ha)`
}

const pathLength = (latlngs: LatLng[]) =>
  latlngs.length < 2 ?
    0
  : turfLength(
      lineString(latlngs.map((l) => [l.lng, l.lat])) as Feature<LineString>,
      { units: 'meters' },
    )

const pathArea = (latlngs: LatLng[]) => {
  if (latlngs.length < 3) return 0
  const ring = [
    ...latlngs.map((l) => [l.lng, l.lat]),
    [latlngs[0]!.lng, latlngs[0]!.lat],
  ]
  return turfArea(turfPolygon([ring]) as Feature<PolygonGeometry>)
}

// ToolbarButtonProps omits 'size', but the underlying button accepts it —
// bridge the type locally to keep passing it through.
const Button = ToolbarButton as unknown as FC<
  ComponentProps<typeof ToolbarButton> & {
    size?: string
  }
>

export const MeasureButton = () => {
  const map = useMap()
  const { formatMessage } = useIntl()
  const [measuring, setMeasuring] = useState(false)
  // LatLngs of the fixed vertices of the measurement being taken
  const latlngsRef = useRef<LatLng[]>([])
  // the layers of the measurement being taken
  const layerGroupRef = useRef<LayerGroup | null>(null)
  // the layers of the last completed measurement
  const completedGroupRef = useRef<LayerGroup | null>(null)
  const pathRef = useRef<Polyline | null>(null)
  const rubberRef = useRef<Polyline | null>(null)
  const cursorRef = useRef<CircleMarker | null>(null)

  // useCallback-stable so the measuring effect below can use them without
  // re-running on every render (which would reset an in-progress
  // measurement on unrelated store updates)
  const removeCompleted = useCallback(() => {
    completedGroupRef.current?.remove()
    completedGroupRef.current = null
  }, [])

  // (re)create the in-progress layers. They are dropped when a measurement
  // completes (or is cancelled) and recreated when the next one starts —
  // that way every measurement in a measuring session is visible, not
  // just the first
  const ensureInProgressLayers = useCallback(() => {
    if (!layerGroupRef.current) {
      layerGroupRef.current = new LayerGroup().addTo(map)
    }
    if (!pathRef.current) {
      pathRef.current = new Polyline([], {
        color: ACTIVE_COLOR,
        weight: 2,
      }).addTo(layerGroupRef.current)
    }
    if (!rubberRef.current) {
      rubberRef.current = new Polyline([], {
        color: ACTIVE_COLOR,
        weight: 1,
        dashArray: '4,4',
      }).addTo(layerGroupRef.current)
    }
    if (!cursorRef.current) {
      // invisible marker following the cursor; carries the live tooltip
      cursorRef.current = new CircleMarker(map.getCenter(), {
        radius: 0,
        interactive: false,
      })
        // the default 'top' offset pins the tooltip right at the pointer,
        // hiding the spot being clicked — lift it clear of the crosshair
        .bindTooltip('', {
          permanent: true,
          direction: 'top',
          opacity: 1,
          offset: [0, -15],
        })
        .addTo(layerGroupRef.current)
    }
  }, [map])

  const removeInProgressLayers = useCallback(() => {
    latlngsRef.current = []
    layerGroupRef.current?.remove()
    layerGroupRef.current = null
    pathRef.current = null
    rubberRef.current = null
    cursorRef.current = null
  }, [])

  useEffect(() => {
    if (!measuring) return

    map.getContainer()?.classList.add(MEASURE_ACTIVE_CLASS)

    const redraw = (cursor?: LatLng) => {
      ensureInProgressLayers()
      const latlngs = latlngsRef.current
      pathRef.current?.setLatLngs(latlngs)
      const base = pathLength(latlngs)
      const live =
        cursor ? base + pathLength([...latlngs.slice(-1), cursor]) : base
      const hint =
        latlngs.length ?
          formatMessage({
            id: 'mapMeasureFinishHint',
            defaultMessage: 'Doppelklick beendet die Messung',
          })
        : formatMessage({
            id: 'mapMeasureStartHint',
            defaultMessage: 'Klicken, um die Messung zu beginnen',
          })
      if (cursor || latlngs.length) {
        cursorRef.current?.setLatLng(
          cursor ?? latlngs[latlngs.length - 1] ?? map.getCenter(),
        )
        // the tooltip starts closed (see below); open it once there is
        // something to show
        cursorRef.current?.openTooltip()
        cursorRef.current
          ?.getTooltip()
          ?.setContent(
            latlngs.length ? `${formatLength(live)}<br />${hint}` : hint,
          )
      } else {
        // before the first pointer position there is nothing to attach
        // the tooltip to — don't show it at the map center
        cursorRef.current?.closeTooltip()
      }
    }

    const onClick = (e: LeafletMouseEvent) => {
      latlngsRef.current.push(e.latlng)
      redraw()
    }
    const onPointerMove = (e: LeafletMouseEvent) => {
      const latlngs = latlngsRef.current
      redraw(e.latlng)
      if (!latlngs.length) return
      rubberRef.current?.setLatLngs([latlngs[latlngs.length - 1]!, e.latlng])
    }
    const finish = () => {
      const latlngs = latlngsRef.current
      // the double click fires two clicks first, which added (nearly) the
      // same vertex twice: merge vertices that are pixels apart
      const deduped = latlngs.filter((ll, i) => {
        if (i === 0) return true
        const prev = latlngs[i - 1]!
        return (
          map
            .latLngToContainerPoint(ll)
            .distanceTo(map.latLngToContainerPoint(prev)) >
          VERTEX_MERGE_DISTANCE_PX
        )
      })
      if (deduped.length < 2) return

      // the completed measurement replaces everything: the previous
      // result and the in-progress layers
      removeCompleted()
      removeInProgressLayers()
      const completedGroup = new LayerGroup()
      completedGroup.addTo(map)
      completedGroupRef.current = completedGroup
      const completed = new Polyline(deduped, {
        color: COMPLETED_COLOR,
        weight: 2,
      }).addTo(completedGroup)
      const area = pathArea(deduped)
      const content =
        area ?
          `${formatLength(pathLength(deduped))}<br />${formatArea(area)}`
        : formatLength(pathLength(deduped))
      // the remove icon inside the tooltip of a completed measurement
      const removeTitle = formatMessage({
        id: 'mapMeasureRemove',
        defaultMessage: 'Messung entfernen',
      })
      const removeButtonHtml =
        `<button type="button" class="measure-remove" title="${removeTitle}">` +
        '<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">' +
        '<path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>' +
        '</svg></button>'
      completed.bindTooltip(`${content}${removeButtonHtml}`, {
        permanent: true,
        direction: 'top',
        opacity: 1,
        interactive: true,
        className: 'measure-tooltip',
      })
      new CircleMarker(deduped[0]!, {
        radius: 3,
        color: COMPLETED_COLOR,
        interactive: false,
      }).addTo(completedGroup)
      completed.openTooltip()
      // the remove icon only exists once the tooltip is open
      const removeButton = completed
        .getTooltip()
        ?.getElement()
        ?.querySelector<HTMLElement>('.measure-remove')
      if (removeButton) {
        // keep the click from reaching the map
        DomEvent.disableClickPropagation(removeButton)
        removeButton.addEventListener('click', () => removeCompleted())
      }
      // one measurement per activation: leave the measuring mode, the
      // result stays until it is removed or a new measurement is started
      setMeasuring(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // cancel the current measurement, keep the measuring mode
        pathRef.current?.setLatLngs([])
        rubberRef.current?.setLatLngs([])
        latlngsRef.current = []
        redraw()
      }
      if (e.key === 'Enter') finish()
    }

    map.on('click', onClick)
    map.on('dblclick', finish)
    map.on('pointermove', onPointerMove)
    window.addEventListener('keydown', onKeyDown)
    redraw()

    return () => {
      map.getContainer()?.classList.remove(MEASURE_ACTIVE_CLASS)
      map.off('click', onClick)
      map.off('dblclick', finish)
      map.off('pointermove', onPointerMove)
      window.removeEventListener('keydown', onKeyDown)
      // the in-progress path is discarded, the completed measurement
      // stays until it is removed or a new one is started
      removeInProgressLayers()
    }
  }, [
    map,
    measuring,
    formatMessage,
    ensureInProgressLayers,
    removeInProgressLayers,
    removeCompleted,
  ])

  useEffect(
    () => () => {
      // remove everything when the map unmounts
      layerGroupRef.current?.remove()
      layerGroupRef.current = null
      removeCompleted()
    },
    // removeCompleted is useCallback-stable, so this runs on unmount only
    [removeCompleted],
  )

  const toggleMeasuring = () => {
    if (!measuring) {
      // a new measuring session discards the previous result
      removeCompleted()
    }
    setMeasuring(!measuring)
  }

  const label =
    measuring ?
      formatMessage({
        id: 'mapMeasureStop',
        defaultMessage: 'Messung beenden',
      })
    : formatMessage({
        id: 'mapMeasure',
        defaultMessage: 'Distanz und Fläche messen',
      })

  return (
    <Button
      name="measure"
      onClick={toggleMeasuring}
      aria-label={label}
      title={label}
      icon={<MdStraighten />}
      size="large"
      className={styles.toolbarButton}
      // like apf2: the icon signals the active measuring mode by color
      // (ToolbarToggleButton's checked state is owned by the enclosing
      // Toolbar, so it cannot reflect the state this component controls)
      style={measuring ? { color: ACTIVE_COLOR } : undefined}
    />
  )
}
