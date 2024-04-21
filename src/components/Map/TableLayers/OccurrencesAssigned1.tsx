import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import { useCorbadoSession } from '@corbado/react'

import { useElectric } from '../../../ElectricProvider'
import { Vector_layers as VectorLayer } from '../../../generated/client'
import { TableLayer } from './TableLayer'

interface Props {
  layer: VectorLayer
}

export const OccurrencesAssigned1 = ({ layer }: Props) => {
  const { user: authUser } = useCorbadoSession()
  const { subproject_id } = useParams()
  const { db } = useElectric()!

  // TODO: query only inside current map bounds using places.bbox
  const { results: occurrenceImports = [] } = useLiveQuery(
    db.occurrence_imports.liveMany({
      where: { subproject_id: subproject_id },
    }),
  )
  const { results: places = [] } = useLiveQuery(
    db.places.liveMany({ where: { parent_id: null } }),
  )
  const { results: occurrences = [] } = useLiveQuery(
    db.occurrences.liveMany({
      where: {
        occurrence_import_id: {
          in: occurrenceImports.map((oi) => oi.occurrence_import_id),
        },
        place_id: { in: places.map((p) => p.place_id) },
        geometry: { not: null },
      },
    }),
  )
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

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
  if (!layer) return null

  const isDraggable = appState?.draggable_layers?.includes?.(
    layer?.label?.replace(/ /g, '-')?.toLowerCase(),
  )

  // popups pop on mouseup (=dragend)
  // so they should not be bound when draggable or they will pop on dragend
  // thus adding key={isDraggable} to re-render when draggable changes
  return <TableLayer key={isDraggable} data={data} layer={layer} />
}
