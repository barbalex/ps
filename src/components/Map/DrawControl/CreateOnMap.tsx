import { useEffect, useRef, useState } from 'react'
import { Button } from '@fluentui/react-components'
import { DomEvent, Marker, Polyline, type LeafletEvent } from 'leaflet'
import { useMap } from 'react-leaflet'
import { useAtomValue } from 'jotai'
import { useIntl } from 'react-intl'
import { bbox } from '@turf/bbox'

import { DrawToolbar } from './DrawToolbar.tsx'
import {
  mapCreationAtom,
  type MapCreation,
} from '../../../modules/mapCreation.ts'
import {
  createPlace,
  createCheck,
  createAction,
} from '../../../modules/createRows.ts'
import {
  addNotificationAtom,
  languageAtom,
  mapInfoAtom,
  store,
  type MapInfoLayer,
} from '../../../store.ts'
import styles from './PrecisePoint.module.css'

export function CreateOnMap({ draft }: { draft: MapCreation }) {
  const map = useMap()
  const language = useAtomValue(languageAtom)
  const { formatMessage } = useIntl()
  const panel = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let saving = false
    const container = map.getContainer()
    container.classList.add('geoman-active')
    DomEvent.disableClickPropagation(panel.current!)
    DomEvent.disableScrollPropagation(panel.current!)
    const cancel = () => {
      if (!saving) store.set(mapCreationAtom, null)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cancel()
    }
    const created = async (e: LeafletEvent) => {
      if (
        !('layer' in e) ||
        !(e.layer instanceof Marker || e.layer instanceof Polyline)
      )
        return
      const { geometry } = e.layer.toGeoJSON(false)
      e.layer.remove()
      if (saving || store.get(mapCreationAtom) !== draft) return
      saving = true
      setBusy(true)
      try {
        const bounds = bbox(geometry)
        const firstGeometry = {
          geometry: {
            type: 'GeometryCollection' as const,
            geometries: [geometry],
          },
          bbox: bounds,
        }
        const { projectId, subprojectId, placeId, level, table } = draft
        let id: string
        if (table === 'place') {
          id = await createPlace({
            projectId,
            subprojectId,
            parentId: placeId,
            level,
            firstGeometry,
          })
        } else {
          if (!placeId) throw new Error('Missing parent place')
          id = await (table === 'check' ? createCheck : createAction)({
            projectId,
            placeId,
            firstGeometry,
          })
        }
        if (store.get(mapCreationAtom) !== draft) return
        const target: MapInfoLayer & { projectId: string } = {
          label: draft.layerLabel,
          featureLabel: id,
          projectId,
          ownTable: table,
          ownId: id,
          ownSubprojectId: subprojectId,
          ownPlaceId: table === 'place' ? undefined : (placeId ?? undefined),
          ownParentId: table === 'place' ? (placeId ?? undefined) : undefined,
          properties: [],
          formActive: true,
        }
        store.set(mapCreationAtom, null)
        store.set(mapInfoAtom, {
          lat: (bounds[1] + bounds[3]) / 2,
          lng: (bounds[0] + bounds[2]) / 2,
          zoom: map.getZoom(),
          layers: [target],
        })
      } catch (error) {
        store.set(addNotificationAtom, {
          intent: 'error',
          body: error instanceof Error ? error.message : String(error),
        })
      } finally {
        saving = false
        setBusy(false)
      }
    }
    window.addEventListener('keydown', onKey)
    map.on('geoman:create', created)
    map.geoman?.enableDraw('Marker', { continueDrawing: false })
    return () => {
      window.removeEventListener('keydown', onKey)
      map.off('geoman:create', created)
      if (map.geoman?.globalDrawModeEnabled()) map.geoman.disableDraw()
      container.classList.remove('geoman-active')
      if (store.get(mapCreationAtom) === draft) store.set(mapCreationAtom, null)
    }
  }, [map, draft])

  return (
    <>
      <DrawToolbar
        language={language}
        createOnly
      />
      <div
        className={styles.session}
        ref={panel}
      >
        <span>
          {formatMessage(
            {
              id: 'mapCreateDraw',
              defaultMessage:
                '{layer}: Punkt auf der Karte setzen oder ein Zeichenwerkzeug wählen.',
            },
            { layer: draft.layerLabel },
          )}
        </span>
        <Button
          size="small"
          disabled={busy}
          onClick={() => store.set(mapCreationAtom, null)}
        >
          {formatMessage({ id: 'cancel', defaultMessage: 'Abbrechen' })}
        </Button>
      </div>
    </>
  )
}
