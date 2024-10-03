import { memo, useEffect, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { useElectric } from '../../ElectricProvider.tsx'
import { updateVectorLayerDisplaysForLayerAndPropertyValues } from './updateVectorLayerDisplaysForLayerAndPropertyValues.ts'

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
  // places level 1
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
  // places level 2
  const { results: places2Fields = [] } = useLiveQuery(
    db.fields.liveMany({
      where: { table_name: 'places', level: 2, project_id },
      select: { name: true },
    }),
  )
  const places2Properties = useMemo(
    () => places2Fields.map((field) => field.name),
    [places2Fields],
  )
  // actions level 1
  const { results: actions1Fields = [] } = useLiveQuery(
    db.fields.liveMany({
      where: { table_name: 'actions', level: 1, project_id },
      select: { name: true },
    }),
  )
  const actions1Properties = useMemo(
    () => actions1Fields.map((field) => field.name),
    [actions1Fields],
  )
  // actions level 2
  const { results: actions2Fields = [] } = useLiveQuery(
    db.fields.liveMany({
      where: { table_name: 'actions', level: 2, project_id },
      select: { name: true },
    }),
  )
  const actions2Properties = useMemo(
    () => actions2Fields.map((field) => field.name),
    [actions2Fields],
  )
  // checks level 1
  const { results: checks1Fields = [] } = useLiveQuery(
    db.fields.liveMany({
      where: { table_name: 'checks', level: 1, project_id },
      select: { name: true },
    }),
  )
  const checks1Properties = useMemo(
    () => checks1Fields.map((field) => field.name),
    [checks1Fields],
  )
  // checks level 2
  const { results: checks2Fields = [] } = useLiveQuery(
    db.fields.liveMany({
      where: { table_name: 'checks', level: 2, project_id },
      select: { name: true },
    }),
  )
  const checks2Properties = useMemo(
    () => checks2Fields.map((field) => field.name),
    [checks2Fields],
  )
  // occurrences-assigned
  // TODO: level 1/2 i.e. query where place_id has level 1/2
  const { results: occurrencesAssignedFields = [] } = useLiveQuery(
    db.fields.liveMany({
      where: {
        table_name: 'occurrences',
        project_id,
        // TODO: query where place_id has level 1
        place_id: { not: null },
      },
      select: { name: true },
    }),
  )
  // occurrences-to-assess
  const { results: occurrencesToAssessFields = [] } = useLiveQuery(
    db.fields.liveMany({
      where: {
        table_name: 'occurrences',
        project_id,
        place_id: null,
        not_to_assign: { not: true },
      },
      select: { name: true },
    }),
  )
  // occurrences-not-to-assign
  const { results: occurrencesNotToAssignFields = [] } = useLiveQuery(
    db.fields.liveMany({
      where: {
        table_name: 'occurrences',
        project_id,
        place_id: null,
        not_to_assign: true,
      },
      select: { name: true },
    }),
  )

  // this is how to do when extracting properties from a json field:
  // BUT: for wfs only needed on import, no more changes after that!
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

  useEffect(() => {
    if (!project_id) return
    // TODO: loop all vector_layers
    // if vector_layer.type includes 'places' and vector_layer.properties is not equal to placesProperties
    // update vector_layer.properties to placesProperties
    console.log('VectorLayersPropertiesProvider providing properties')
    for (const vectorLayer of vectorLayers) {
      // places level 1
      if (
        vectorLayer.own_table === 'places' &&
        vectorLayer.own_table_level === 1
      ) {
        if (!isEqual(vectorLayer.properties, places1Properties)) {
          db.vector_layers.update({
            where: { vector_layer_id: vectorLayer.vector_layer_id },
            data: { properties: places1Properties },
          })
          updateVectorLayerDisplaysForLayerAndPropertyValues({
            db,
            vectorLayerId: vectorLayer.vector_layer_id,
            properties: places1Properties,
          })
        }
      }
      // places level 2
      if (
        vectorLayer.own_table === 'places' &&
        vectorLayer.own_table_level === 2
      ) {
        if (!isEqual(vectorLayer.properties, places2Properties)) {
          db.vector_layers.update({
            where: { vector_layer_id: vectorLayer.vector_layer_id },
            data: { properties: places2Properties },
          })
          updateVectorLayerDisplaysForLayerAndPropertyValues({
            db,
            vectorLayerId: vectorLayer.vector_layer_id,
            properties: places2Properties,
          })
        }
      }
      // actions level 1
      if (
        vectorLayer.own_table === 'actions' &&
        vectorLayer.own_table_level === 1
      ) {
        if (!isEqual(vectorLayer.properties, actions1Properties)) {
          db.vector_layers.update({
            where: { vector_layer_id: vectorLayer.vector_layer_id },
            data: { properties: actions1Properties },
          })
          updateVectorLayerDisplaysForLayerAndPropertyValues({
            db,
            vectorLayerId: vectorLayer.vector_layer_id,
            properties: actions1Properties,
          })
        }
      }
      // actions level 2
      if (
        vectorLayer.own_table === 'actions' &&
        vectorLayer.own_table_level === 2
      ) {
        if (!isEqual(vectorLayer.properties, actions2Properties)) {
          db.vector_layers.update({
            where: { vector_layer_id: vectorLayer.vector_layer_id },
            data: { properties: actions2Properties },
          })
          updateVectorLayerDisplaysForLayerAndPropertyValues({
            db,
            vectorLayerId: vectorLayer.vector_layer_id,
            properties: actions2Properties,
          })
        }
      }
      // checks level 1
      if (
        vectorLayer.own_table === 'checks' &&
        vectorLayer.own_table_level === 1
      ) {
        if (!isEqual(vectorLayer.properties, checks1Properties)) {
          db.vector_layers.update({
            where: { vector_layer_id: vectorLayer.vector_layer_id },
            data: { properties: checks1Properties },
          })
          updateVectorLayerDisplaysForLayerAndPropertyValues({
            db,
            vectorLayerId: vectorLayer.vector_layer_id,
            properties: checks1Properties,
          })
        }
      }
      // checks level 2
      if (
        vectorLayer.own_table === 'checks' &&
        vectorLayer.own_table_level === 2
      ) {
        if (!isEqual(vectorLayer.properties, checks2Properties)) {
          db.vector_layers.update({
            where: { vector_layer_id: vectorLayer.vector_layer_id },
            data: { properties: checks2Properties },
          })
          updateVectorLayerDisplaysForLayerAndPropertyValues({
            db,
            vectorLayerId: vectorLayer.vector_layer_id,
            properties: checks2Properties,
          })
        }
      }
      // occurrences-assigned
      if (vectorLayer.own_table === 'occurrences_assigned') {
        if (!isEqual(vectorLayer.properties, occurrencesAssignedFields)) {
          db.vector_layers.update({
            where: { vector_layer_id: vectorLayer.vector_layer_id },
            data: { properties: occurrencesAssignedFields },
          })
          updateVectorLayerDisplaysForLayerAndPropertyValues({
            db,
            vectorLayerId: vectorLayer.vector_layer_id,
            properties: occurrencesAssignedFields,
          })
        }
      }
      // occurrences-to-assess
      if (vectorLayer.own_table === 'occurrences_to_assess') {
        if (!isEqual(vectorLayer.properties, occurrencesToAssessFields)) {
          db.vector_layers.update({
            where: { vector_layer_id: vectorLayer.vector_layer_id },
            data: { properties: occurrencesToAssessFields },
          })
          updateVectorLayerDisplaysForLayerAndPropertyValues({
            db,
            vectorLayerId: vectorLayer.vector_layer_id,
            properties: occurrencesToAssessFields,
          })
        }
      }
      // occurrences-not-to-assign
      if (vectorLayer.own_table === 'occurrences_not_to_assign') {
        if (!isEqual(vectorLayer.properties, occurrencesNotToAssignFields)) {
          db.vector_layers.update({
            where: { vector_layer_id: vectorLayer.vector_layer_id },
            data: { properties: occurrencesNotToAssignFields },
          })
        }
      }
    }
  }, [
    actions1Properties,
    actions2Properties,
    checks1Properties,
    checks2Properties,
    db,
    db.vector_layers,
    occurrencesAssignedFields,
    occurrencesNotToAssignFields,
    occurrencesToAssessFields,
    places1Properties,
    places2Properties,
    project_id,
    vectorLayers,
  ])

  return null
})
