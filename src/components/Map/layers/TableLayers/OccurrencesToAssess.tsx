import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from 'react-router-dom'
import { useAtom } from 'jotai'

import { TableLayer } from './TableLayer.tsx'
import { draggableLayersAtom } from '../../../../store.ts'

export const OccurrencesToAssess = ({ layerPresentation }) => {
  const [draggableLayers] = useAtom(draggableLayersAtom)
  const { subproject_id } = useParams()
  const res = useLiveQuery(
    `
    SELECT o.*
    FROM occurrences o
      INNER JOIN occurrence_imports oi ON o.occurrence_import_id = oi.occurrence_import_id
    WHERE 
      oi.subproject_id = $1
      AND o.place_id IS NULL
      AND (o.not_to_assign IS NULL OR o.not_to_assign = FALSE)
      AND o.geometry IS NOT NULL
  `,
    [subproject_id],
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
