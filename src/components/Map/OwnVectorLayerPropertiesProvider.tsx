import { memo, useEffect, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { useElectric } from '../../ElectricProvider.tsx'

export const OwnVectorLayerPropertiesProvider = memo(() => {
  const { project_id = '99999999-9999-9999-9999-999999999999' } = useParams()
  const { db } = useElectric()!

  // get vector_layers
  const { results: vectorLayers = [] } = useLiveQuery(
    db.vector_layers.liveMany({
      where: { project_id, type: 'own' },
      select: { vector_layer_id: true, properties: true, own_table: true },
    }),
  )
  const { results: subprojects = [] } = useLiveQuery(
    db.subprojects.liveMany({
      where: { project_id },
    }),
  )
  const { results: places1Fields = [] } = useLiveQuery(
    db.fields.liveMany({
      where: { table_name: 'places', level: 1, project_id },
      select: { name: true },
    }),
  )
  const places1Properties = useMemo(
    () => places1Fields.map((field) => field.name),
    [places1Fields],
  )
  // this is how to do when extracting properties from a json field:
  // 1. get json data
  // const { results: places1Data = [] } = useLiveQuery(
  //   db.places.liveMany({
  //     where: {
  //       subproject_id: {
  //         in: subprojects.map((subproject) => subproject.subproject_id),
  //       },
  //       level: 1,
  //     },
  //     select: { data: true },
  //   }),
  // )
  // 2. extract keys from json data
  // const places1Properties = useMemo(() => {
  //   const keys = []
  //   for (const place of places1Data) {
  //     const myKeys = Object.keys(place.data)
  //     for (const key of myKeys) {
  //       if (!keys.includes(key)) keys.push(key)
  //     }
  //   }
  //   return keys
  // }, [places1Data])

  console.log('VectorLayersPropertiesProvider', {
    vectorLayers,
    subprojects,
    places1Fields,
  })

  // when a key inside places.data changes, update vector_layers.properties:
  // set it as an array of places.data's keys
  useEffect(() => {
    if (!project_id) return
    // TODO: loop all vector_layers
    // if vector_layer.type includes 'places' and vector_layer.properties is not equal to placesProperties
    // update vector_layer.properties to placesProperties
    for (const vectorLayer of vectorLayers) {
      if (vectorLayer.own_table === 'places') {
        if (!isEqual(vectorLayer.properties, places1Properties)) {
          db.vector_layers.update({
            where: { vector_layer_id: vectorLayer.vector_layer_id },
            data: { properties: places1Properties },
          })
        }
      }
    }
  }, [db.vector_layers, places1Properties, project_id, vectorLayers])

  return null
})
