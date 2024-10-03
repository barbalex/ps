import { memo, useEffect, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { useElectric } from '../../ElectricProvider.tsx'

export const VectorLayersPropertiesProvider = memo(() => {
  const { project_id = '99999999-9999-9999-9999-999999999999' } = useParams()
  const { db } = useElectric()!

  // get vector_layers
  const { results: vectorLayers = [] } = useLiveQuery(
    db.vector_layers.liveMany({
      where: { project_id },
      select: { vector_layer_id: true, properties: true, type: true },
    }),
  )
  const { results: subprojects = [] } = useLiveQuery(
    db.subprojects.liveMany({
      where: { project_id },
    }),
  )
  const { results: placesData = [] } = useLiveQuery(
    db.places.liveMany({
      where: {
        subproject_id: {
          in: subprojects.map((subproject) => subproject.subproject_id),
        },
      },
      select: { data: true },
    }),
  )
  const placesProperties = useMemo(() => {
    const keys = []
    for (const place of placesData) {
      const myKeys = Object.keys(place.data)
      for (const key of myKeys) {
        if (!keys.includes(key)) keys.push(key)
      }
    }
    return keys
  }, [placesData])

  // get vector_layers.properties

  console.log('VectorLayersPropertiesProvider', {
    vectorLayers,
    subprojects,
    placesData,
    placesProperties,
  })

  // when a key inside places.data changes, update vector_layers.properties:
  // set it as an array of places.data's keys
  useEffect(() => {
    if (!project_id) return
    // TODO: loop all vector_layers
    // if vector_layer.type includes 'places' and vector_layer.properties is not equal to placesProperties
    // update vector_layer.properties to placesProperties
    for (const vectorLayer of vectorLayers) {
      if (vectorLayer.type.includes('places')) {
        if (!isEqual(vectorLayer.properties, placesProperties)) {
          db.vector_layers.update({
            where: { vector_layer_id: vectorLayer.vector_layer_id },
            data: { properties: placesProperties },
          })
        }
      }
    }
  }, [db.vector_layers, placesProperties, project_id, vectorLayers])

  return null
})
