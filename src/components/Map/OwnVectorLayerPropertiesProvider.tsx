import { useEffect, useMemo } from 'react'
import { useParams } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { completeVectorLayerDisplaysForLayerWithProperties } from './completeVectorLayerDisplaysForLayerWithProperties.ts'
import { addOperationAtom } from '../../store.ts'

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
  const vectorLayers = useMemo(() => resVL?.rows ?? [], [resVL])

  // places level 1
  const resPlaces1Fields = useLiveQuery(
    `SELECT field_id, name FROM fields WHERE table_name = 'places' AND level = 1 AND project_id = $1`,
    [project_id],
  )
  const places1Properties = useMemo(
    () => resPlaces1Fields?.rows?.map((field) => field.name) ?? [],
    [resPlaces1Fields],
  )

  // places level 2
  const resPlaces2Fields = useLiveQuery(
    `SELECT field_id, name FROM fields WHERE table_name = 'places' AND level = 2 AND project_id = $1`,
    [project_id],
  )
  const places2Properties = useMemo(
    () => resPlaces2Fields?.rows?.map((field) => field.name) ?? [],
    [resPlaces2Fields],
  )

  // actions level 1
  const resActions1Fields = useLiveQuery(
    `SELECT field_id, name FROM fields WHERE table_name = 'actions' AND level = 1 AND project_id = $1`,
    [project_id],
  )
  const actions1Properties = useMemo(
    () => resActions1Fields?.rows?.map((field) => field.name) ?? [],
    [resActions1Fields],
  )

  // actions level 2
  const resActions2Fields = useLiveQuery(
    `SELECT field_id, name FROM fields WHERE table_name = 'actions' AND level = 2 AND project_id = $1`,
    [project_id],
  )
  const actions2Properties = useMemo(
    () => resActions2Fields?.rows?.map((field) => field.name) ?? [],
    [resActions2Fields],
  )

  // checks level 1
  const resChecks1Fields = useLiveQuery(
    `SELECT field_id, name FROM fields WHERE table_name = 'checks' AND level = 1 AND project_id = $1`,
    [project_id],
  )
  const checks1Properties = useMemo(
    () => resChecks1Fields?.rows?.map((field) => field.name) ?? [],
    [resChecks1Fields],
  )

  // checks level 2
  const resChecks2Fields = useLiveQuery(
    `SELECT field_id, name FROM fields WHERE table_name = 'checks' AND level = 2 AND project_id = $1`,
    [project_id],
  )
  const checks2Properties = useMemo(
    () => resChecks2Fields?.rows?.map((field) => field.name) ?? [],
    [resChecks2Fields],
  )

  // occurrences-assigned
  // TODO: how to distinguish assigned, to assess and not to assign? place_id or not_to_assign are on occurrences, not fields...
  // TODO: level 1/2 i.e. query where place_id has level 1/2
  const resOccurrencesAssignedFields = useLiveQuery(
    `SELECT field_id, name FROM fields WHERE table_name = 'occurrences' AND project_id = $1-- AND place_id IS NOT NULL`,
    [project_id],
  )
  const occurrencesAssignedFields = useMemo(
    () => resOccurrencesAssignedFields?.rows?.map((field) => field.name) ?? [],
    [resOccurrencesAssignedFields],
  )

  // occurrences-to-assess
  const resOccurrencesToAssessFields = useLiveQuery(
    `SELECT field_id, name FROM fields WHERE table_name = 'occurrences' AND project_id = $1-- AND place_id IS NULL AND not_to_assign IS NOT TRUE`,
    [project_id],
  )
  const occurrencesToAssessFields = useMemo(
    () => resOccurrencesToAssessFields?.rows?.map((field) => field.name) ?? [],
    [resOccurrencesToAssessFields],
  )

  // occurrences-not-to-assign
  const resOccurrencesNotToAssignFields = useLiveQuery(
    `SELECT field_id, name FROM fields WHERE table_name = 'occurrences' AND project_id = $1-- AND place_id IS NULL AND not_to_assign IS TRUE`,
    [project_id],
  )
  const occurrencesNotToAssignFields = useMemo(
    () =>
      resOccurrencesNotToAssignFields?.rows?.map((field) => field.name) ?? [],
    [resOccurrencesNotToAssignFields],
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
          completeVectorLayerDisplaysForLayerWithProperties({
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
          db.query(
            `UPDATE vector_layers SET properties = $1 WHERE vector_layer_id = $2`,
            [places2Properties, vectorLayer.vector_layer_id],
          )
          completeVectorLayerDisplaysForLayerWithProperties({
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
          db.query(
            `UPDATE vector_layers SET properties = $1 WHERE vector_layer_id = $2`,
            [actions1Properties, vectorLayer.vector_layer_id],
          )
          completeVectorLayerDisplaysForLayerWithProperties({
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
          db.query(
            `UPDATE vector_layers SET properties = $1 WHERE vector_layer_id = $2`,
            [actions2Properties, vectorLayer.vector_layer_id],
          )
          completeVectorLayerDisplaysForLayerWithProperties({
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
          db.query(
            `UPDATE vector_layers SET properties = $1 WHERE vector_layer_id = $2`,
            [checks1Properties, vectorLayer.vector_layer_id],
          )
          completeVectorLayerDisplaysForLayerWithProperties({
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
          db.query(
            `UPDATE vector_layers SET properties = $1 WHERE vector_layer_id = $2`,
            [checks2Properties, vectorLayer.vector_layer_id],
          )
          completeVectorLayerDisplaysForLayerWithProperties({
            db,
            vectorLayerId: vectorLayer.vector_layer_id,
            properties: checks2Properties,
          })
        }
      }
      // occurrences-assigned
      if (vectorLayer.own_table === 'occurrences_assigned') {
        if (!isEqual(vectorLayer.properties, occurrencesAssignedFields)) {
          db.query(
            `UPDATE vector_layers SET properties = $1 WHERE vector_layer_id = $2`,
            [occurrencesAssignedFields, vectorLayer.vector_layer_id],
          )
          completeVectorLayerDisplaysForLayerWithProperties({
            db,
            vectorLayerId: vectorLayer.vector_layer_id,
            properties: occurrencesAssignedFields,
          })
        }
      }
      // occurrences-to-assess
      if (vectorLayer.own_table === 'occurrences_to_assess') {
        if (!isEqual(vectorLayer.properties, occurrencesToAssessFields)) {
          db.query(
            `UPDATE vector_layers SET properties = $1 WHERE vector_layer_id = $2`,
            [occurrencesToAssessFields, vectorLayer.vector_layer_id],
          )
          completeVectorLayerDisplaysForLayerWithProperties({
            db,
            vectorLayerId: vectorLayer.vector_layer_id,
            properties: occurrencesToAssessFields,
          })
        }
      }
      // occurrences-not-to-assign
      if (vectorLayer.own_table === 'occurrences_not_to_assign') {
        if (!isEqual(vectorLayer.properties, occurrencesNotToAssignFields)) {
          db.query(
            `UPDATE vector_layers SET properties = $1 WHERE vector_layer_id = $2`,
            [occurrencesNotToAssignFields, vectorLayer.vector_layer_id],
          )
        }
      }
    }
  }, [
    actions1Properties,
    actions2Properties,
    checks1Properties,
    checks2Properties,
    db,
    occurrencesAssignedFields,
    occurrencesNotToAssignFields,
    occurrencesToAssessFields,
    places1Properties,
    places2Properties,
    project_id,
    vectorLayers,
  ])

  return null
}
