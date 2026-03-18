import { useParams } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { TableLayer } from './TableLayer.tsx'
import { draggableLayersAtom } from '../../../../store.ts'
import type Observations from '../../../../models/public/Observations.ts'

export const ObservationsAssigned1 = ({ layerPresentation }) => {
  const draggableLayers = useAtomValue(draggableLayersAtom)
  const { subprojectId } = useParams({ strict: false })

  const res = useLiveQuery(
    `
    SELECT o.observation_id, o.account_id, o.observation_import_id, o.place_id, o.not_to_assign,
      o.comment, o.data, o.id_in_source, ST_AsGeoJSON(o.geometry)::json as geometry,
      o.label, o.created_at, o.updated_at, o.updated_by
    FROM observations o
      INNER JOIN observation_imports oi ON o.observation_import_id = oi.observation_import_id
      INNER JOIN places p ON o.place_id = p.place_id
    WHERE 
      o.geometry IS NOT NULL
      AND oi.subproject_id = $1
      AND p.parent_id IS NULL
  `,
    [subprojectId],
  )
  const observations: Observations[] = res?.rows ?? []

  // geometry is stored as PostGIS GeometryCollection; convert to FeatureCollection for display
  // properties need to go into every feature
  const data = observations.map((p) => {
    // add p's properties to all features:
    // TODO: make properties more readable for user
    // Idea: use iframe to open form, see TableLayer
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { geometry, bbox, data, ...properties } = p
    const fc = {
      type: 'FeatureCollection',
      features: (geometry?.geometries ?? []).map((g) => ({
        type: 'Feature',
        geometry: g,
        properties: {},
      })),
    }
    if (!data) return fc
    fc.features.forEach((f) => {
      f.properties = properties ?? {}
      // data is _not_ passed under the data property due to errors created
      for (const [key, value] of Object.entries(data)) {
        // ensure that properties are not overwritten
        // but also make sure if key is used for styling, it is not changed...
        if (key in properties) {
          f.properties[`_${key}`] = properties[key]
        }
        f.properties[key] = value
      }
    })

    return fc
  })

  if (!data?.length) return null
  if (!layerPresentation) return null

  const layer = layerPresentation.vector_layers
  const isDraggable = draggableLayers?.includes?.(
    layer?.label?.replace(/ /g, '-')?.toLowerCase(),
  )

  // popups pop on mouseup (=dragend)
  // so they should not be bound when draggable or they will pop on dragend
  // thus adding key={isDraggable} to re-render when draggable changes
  return (
    <TableLayer
      key={isDraggable}
      data={data}
      layerPresentation={layerPresentation}
    />
  )
}
