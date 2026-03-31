import { useEffect, useMemo } from 'react'
import { useParams } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { completeVectorLayerDisplaysForLayerWithProperties } from './completeVectorLayerDisplaysForLayerWithProperties.ts'
import { addOperationAtom } from '../../store.ts'
import type VectorLayers from '../../models/public/VectorLayers.ts'

export const OwnVectorLayerPropertiesProvider = () => {
  const { project_id = '99999999-9999-9999-9999-999999999999' } = useParams({
    from: '/data',
  })
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)

  // get vector_layers
  const resVL = useLiveQuery(
    `SELECT * FROM vector_layers WHERE project_id = $1 and type = 'own'`,
    [project_id],
  )
  const vectorLayers: VectorLayers[] = useMemo(() => resVL?.rows ?? [], [resVL])

  // places level 1
  const resPlaces1Fields = useLiveQuery(
    `SELECT field_id, name FROM fields WHERE table_name = 'places' AND level = 1`,
  )
  const places1Properties = useMemo(
    () => resPlaces1Fields?.rows?.map((field) => field.name) ?? [],
    [resPlaces1Fields],
  )

  // places level 2
  const resPlaces2Fields = useLiveQuery(
    `SELECT field_id, name FROM fields WHERE table_name = 'places' AND level = 2`,
  )
  const places2Properties = useMemo(
    () => resPlaces2Fields?.rows?.map((field) => field.name) ?? [],
    [resPlaces2Fields],
  )

  // actions level 1
  const resActions1Fields = useLiveQuery(
    `SELECT field_id, name FROM fields WHERE table_name = 'actions' AND level = 1`,
  )
  const actions1Properties = useMemo(
    () => resActions1Fields?.rows?.map((field) => field.name) ?? [],
    [resActions1Fields],
  )

  // actions level 2
  const resActions2Fields = useLiveQuery(
    `SELECT field_id, name FROM fields WHERE table_name = 'actions' AND level = 2`,
  )
  const actions2Properties = useMemo(
    () => resActions2Fields?.rows?.map((field) => field.name) ?? [],
    [resActions2Fields],
  )

  // checks level 1
  const resChecks1Fields = useLiveQuery(
    `SELECT field_id, name FROM fields WHERE table_name = 'checks' AND level = 1`,
  )
  const checks1Properties = useMemo(
    () => resChecks1Fields?.rows?.map((field) => field.name) ?? [],
    [resChecks1Fields],
  )

  // checks level 2
  const resChecks2Fields = useLiveQuery(
    `SELECT field_id, name FROM fields WHERE table_name = 'checks' AND level = 2`,
  )
  const checks2Properties = useMemo(
    () => resChecks2Fields?.rows?.map((field) => field.name) ?? [],
    [resChecks2Fields],
  )

  // observations-assigned
  // TODO: how to distinguish assigned, to assess and not to assign? place_id or not_to_assign are on observations, not fields...
  // TODO: level 1/2 i.e. query where place_id has level 1/2
  const resObservationsAssignedFields = useLiveQuery(
    `SELECT field_id, name FROM fields WHERE table_name = 'observations'-- AND place_id IS NOT NULL`,
  )
  const observationsAssignedFields = useMemo(
    () => resObservationsAssignedFields?.rows?.map((field) => field.name) ?? [],
    [resObservationsAssignedFields],
  )

  const observationsAssignedLinesProperties = useMemo(
    () => ['observation_label', 'place_label', 'observation_id', 'place_id'],
    [],
  )

  // observations-to-assess
  const resObservationsToAssessFields = useLiveQuery(
    `SELECT field_id, name FROM fields WHERE table_name = 'observations'-- AND place_id IS NULL AND not_to_assign IS NOT TRUE`,
  )
  const observationsToAssessFields = useMemo(
    () => resObservationsToAssessFields?.rows?.map((field) => field.name) ?? [],
    [resObservationsToAssessFields],
  )

  // observations-not-to-assign
  const resObservationsNotToAssignFields = useLiveQuery(
    `SELECT field_id, name FROM fields WHERE table_name = 'observations'-- AND place_id IS NULL AND not_to_assign IS TRUE`,
  )
  const observationsNotToAssignFields = useMemo(
    () =>
      resObservationsNotToAssignFields?.rows?.map((field) => field.name) ?? [],
    [resObservationsNotToAssignFields],
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

    for (const vectorLayer of vectorLayers) {
      // places level 1
      if (
        vectorLayer.own_table === 'places' &&
        vectorLayer.own_table_level === 1
      ) {
        if (!isEqual(vectorLayer.properties, places1Properties)) {
          db.query(
            `UPDATE vector_layers SET properties = $1 WHERE vector_layer_id = $2`,
            [places1Properties, vectorLayer.vector_layer_id],
          )
          addOperation({
            table: 'vector_layers',
            rowIdName: 'vector_layer_id',
            rowId: vectorLayer.vector_layer_id,
            operation: 'update',
            draft: { properties: places1Properties },
            prev: { ...vectorLayer },
          })
          completeVectorLayerDisplaysForLayerWithProperties({
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
          db.query(
            `UPDATE vector_layers SET properties = $1 WHERE vector_layer_id = $2`,
            [places2Properties, vectorLayer.vector_layer_id],
          )
          addOperation({
            table: 'vector_layers',
            rowIdName: 'vector_layer_id',
            rowId: vectorLayer.vector_layer_id,
            operation: 'update',
            draft: { properties: places2Properties },
            prev: { ...vectorLayer },
          })
          completeVectorLayerDisplaysForLayerWithProperties({
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
          db.query(
            `UPDATE vector_layers SET properties = $1 WHERE vector_layer_id = $2`,
            [actions1Properties, vectorLayer.vector_layer_id],
          )
          addOperation({
            table: 'vector_layers',
            rowIdName: 'vector_layer_id',
            rowId: vectorLayer.vector_layer_id,
            operation: 'update',
            draft: { properties: actions1Properties },
            prev: { ...vectorLayer },
          })
          completeVectorLayerDisplaysForLayerWithProperties({
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
          db.query(
            `UPDATE vector_layers SET properties = $1 WHERE vector_layer_id = $2`,
            [actions2Properties, vectorLayer.vector_layer_id],
          )
          addOperation({
            table: 'vector_layers',
            rowIdName: 'vector_layer_id',
            rowId: vectorLayer.vector_layer_id,
            operation: 'update',
            draft: { properties: actions2Properties },
            prev: { ...vectorLayer },
          })
          completeVectorLayerDisplaysForLayerWithProperties({
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
          db.query(
            `UPDATE vector_layers SET properties = $1 WHERE vector_layer_id = $2`,
            [checks1Properties, vectorLayer.vector_layer_id],
          )
          addOperation({
            table: 'vector_layers',
            rowIdName: 'vector_layer_id',
            rowId: vectorLayer.vector_layer_id,
            operation: 'update',
            draft: { properties: checks1Properties },
            prev: { ...vectorLayer },
          })
          completeVectorLayerDisplaysForLayerWithProperties({
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
          db.query(
            `UPDATE vector_layers SET properties = $1 WHERE vector_layer_id = $2`,
            [checks2Properties, vectorLayer.vector_layer_id],
          )
          addOperation({
            table: 'vector_layers',
            rowIdName: 'vector_layer_id',
            rowId: vectorLayer.vector_layer_id,
            operation: 'update',
            draft: { properties: checks2Properties },
            prev: { ...vectorLayer },
          })
          completeVectorLayerDisplaysForLayerWithProperties({
            vectorLayerId: vectorLayer.vector_layer_id,
            properties: checks2Properties,
          })
        }
      }
      // observations-assigned
      if (vectorLayer.own_table === 'observations_assigned') {
        if (!isEqual(vectorLayer.properties, observationsAssignedFields)) {
          db.query(
            `UPDATE vector_layers SET properties = $1 WHERE vector_layer_id = $2`,
            [observationsAssignedFields, vectorLayer.vector_layer_id],
          )
          addOperation({
            table: 'vector_layers',
            rowIdName: 'vector_layer_id',
            rowId: vectorLayer.vector_layer_id,
            operation: 'update',
            draft: { properties: observationsAssignedFields },
            prev: { ...vectorLayer },
          })
          completeVectorLayerDisplaysForLayerWithProperties({
            vectorLayerId: vectorLayer.vector_layer_id,
            properties: observationsAssignedFields,
          })
        }
      }
      // observations-assigned-lines
      if (vectorLayer.own_table === 'observations_assigned_lines') {
        if (
          !isEqual(vectorLayer.properties, observationsAssignedLinesProperties)
        ) {
          db.query(
            `UPDATE vector_layers SET properties = $1 WHERE vector_layer_id = $2`,
            [observationsAssignedLinesProperties, vectorLayer.vector_layer_id],
          )
          addOperation({
            table: 'vector_layers',
            rowIdName: 'vector_layer_id',
            rowId: vectorLayer.vector_layer_id,
            operation: 'update',
            draft: { properties: observationsAssignedLinesProperties },
            prev: { ...vectorLayer },
          })
          completeVectorLayerDisplaysForLayerWithProperties({
            vectorLayerId: vectorLayer.vector_layer_id,
            properties: observationsAssignedLinesProperties,
          })
        }
      }
      // observations-to-assess
      if (vectorLayer.own_table === 'observations_to_assess') {
        if (!isEqual(vectorLayer.properties, observationsToAssessFields)) {
          db.query(
            `UPDATE vector_layers SET properties = $1 WHERE vector_layer_id = $2`,
            [observationsToAssessFields, vectorLayer.vector_layer_id],
          )
          addOperation({
            table: 'vector_layers',
            rowIdName: 'vector_layer_id',
            rowId: vectorLayer.vector_layer_id,
            operation: 'update',
            draft: { properties: observationsToAssessFields },
            prev: { ...vectorLayer },
          })
          completeVectorLayerDisplaysForLayerWithProperties({
            vectorLayerId: vectorLayer.vector_layer_id,
            properties: observationsToAssessFields,
          })
        }
      }
      // observations-not-to-assign
      if (vectorLayer.own_table === 'observations_not_to_assign') {
        if (!isEqual(vectorLayer.properties, observationsNotToAssignFields)) {
          db.query(
            `UPDATE vector_layers SET properties = $1 WHERE vector_layer_id = $2`,
            [observationsNotToAssignFields, vectorLayer.vector_layer_id],
          )
          addOperation({
            table: 'vector_layers',
            rowIdName: 'vector_layer_id',
            rowId: vectorLayer.vector_layer_id,
            operation: 'update',
            draft: { properties: observationsNotToAssignFields },
            prev: { ...vectorLayer },
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
    observationsAssignedFields,
    observationsAssignedLinesProperties,
    observationsNotToAssignFields,
    observationsToAssessFields,
    places1Properties,
    places2Properties,
    project_id,
    vectorLayers,
    addOperation,
  ])

  return null
}
