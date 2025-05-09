import { useParams } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { TableLayer } from './TableLayer.tsx'
import { draggableLayersAtom } from '../../../../store.ts'

export const OccurrencesAssigned1 = ({ layerPresentation }) => {
  const [draggableLayers] = useAtom(draggableLayersAtom)
  const { subprojectId } = useParams({ strict: false })

  const res = useLiveIncrementalQuery(
    `
    SELECT o.*
    FROM occurrences o
      INNER JOIN occurrence_imports oi ON o.occurrence_import_id = oi.occurrence_import_id
      INNER JOIN places p ON o.place_id = p.place_id
    WHERE 
      o.geometry IS NOT NULL
      AND oi.subproject_id = $1
      AND p.parent_id IS NULL
  `,
    [subprojectId],
    'occurrence_id',
  )
  const occurrences = res?.rows ?? []

  // a geometry is built as FeatureCollection Object: https://datatracker.ietf.org/doc/html/rfc7946#section-3.3
  // properties need to go into every feature
  const data = occurrences.map((p) => {
    // add p's properties to all features:
    // TODO: make properties more readable for user
    // Idea: use iframe to open form, see TableLayer
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { geometry, bbox, data, ...properties } = p
    geometry.features.forEach((f) => {
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

    return geometry
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
