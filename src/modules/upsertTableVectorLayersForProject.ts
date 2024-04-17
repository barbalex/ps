import { createVectorLayer, createVectorLayerDisplay } from './createRows'
import { updateTableVectorLayerLabels } from './updateTableVectorLayerLabels'
import { Place_levels as PlaceLevel } from '../generated/client'

export const vectorLayerTables = [
  'places1',
  'places2',
  'actions1',
  'actions2',
  'checks1',
  'checks2',
  'occurrences_assigned1',
  'occurrences_assigned2',
]

export const upsertTableVectorLayersForProject = async ({ db, project_id }) => {
  // depending on place_levels, find what vectorLayerTables need vector layers
  const vectorLayerTablesNeeded = ['places1']
  const vectorLayerTablesNotNeeded = []
  const placeLevels: PlaceLevel[] = await db.place_levels.findMany({
    where: { project_id },
  })
  const places2IsNeeded = placeLevels.some((pl) => pl.level === 2)
  if (places2IsNeeded) {
    vectorLayerTablesNeeded.push('places2')
  } else {
    vectorLayerTablesNotNeeded.push('places2')
  }
  const actions1IsNeeded = placeLevels.some(
    (pl) => pl.level === 1 && pl.actions,
  )
  if (actions1IsNeeded) {
    vectorLayerTablesNeeded.push('actions1')
  } else {
    vectorLayerTablesNotNeeded.push('actions1')
  }
  const actions2IsNeeded = placeLevels.some(
    (pl) => pl.level === 2 && pl.actions,
  )
  if (actions2IsNeeded) {
    vectorLayerTablesNeeded.push('actions2')
  } else {
    vectorLayerTablesNotNeeded.push('actions2')
  }
  const checks1IsNeeded = placeLevels.some((pl) => pl.level === 1 && pl.checks)
  if (checks1IsNeeded) {
    vectorLayerTablesNeeded.push('checks1')
  } else {
    vectorLayerTablesNotNeeded.push('checks1')
  }
  const checks2IsNeeded = placeLevels.some((pl) => pl.level === 2 && pl.checks)
  if (checks2IsNeeded) {
    vectorLayerTablesNeeded.push('checks2')
  } else {
    vectorLayerTablesNotNeeded.push('checks2')
  }
  const occurrencesAssigned1IsNeeded = placeLevels.some(
    (pl) => pl.level === 1 && pl.occurrences,
  )
  if (occurrencesAssigned1IsNeeded) {
    vectorLayerTablesNeeded.push('occurrences_assigned1')
  } else {
    vectorLayerTablesNotNeeded.push('occurrences_assigned1')
  }
  const occurrencesAssigned2IsNeeded = placeLevels.some(
    (pl) => pl.level === 2 && pl.occurrences,
  )
  if (occurrencesAssigned2IsNeeded) {
    vectorLayerTablesNeeded.push('occurrences_assigned2')
  } else {
    vectorLayerTablesNotNeeded.push('occurrences_assigned2')
  }

  // 1. check if vector_layers exist for this project
  const existingVectorLayers = await db.vector_layers.findMany({
    where: { project_id, type: { in: vectorLayerTables } },
  })
  // 2. list tables missing vector_layers:
  const missingVectorLayerTables = vectorLayerTablesNeeded.filter(
    (table) => !existingVectorLayers.some((vl) => vl.type === table),
  )
  const unneededVectorLayerTables = vectorLayerTablesNotNeeded.filter((table) =>
    existingVectorLayers.some((vl) => vl.type === table),
  )
  // 3. create missing vector_layers
  const newVectorLayers = missingVectorLayerTables.map((table) =>
    createVectorLayer({
      project_id,
      type: table,
      label: `${table.charAt(0).toUpperCase()}${table
        .substring(0, table.length - 1)
        .slice(1)} of level ${table.slice(-1)}`,
    }),
  )
  if (newVectorLayers.length) {
    await db.vector_layers.createMany({ data: newVectorLayers })
  }
  // ...and remove unneeded vector_layers
  // this also removes their vector_layer_displays
  await db.vector_layers.deleteMany({
    where: { type: { in: unneededVectorLayerTables } },
  })

  // 4. update vector_layer labels using place_levels
  await updateTableVectorLayerLabels({
    db,
    project_id,
  })

  // 5. check if vector_layer_displays exist for this project
  const allVectorLayers = [...existingVectorLayers, ...newVectorLayers]
  const existingVectorLayerDisplays = await db.vector_layer_displays.findMany({
    where: {
      vector_layer_id: {
        in: allVectorLayers.map((vl) => vl.vector_layer_id),
      },
    },
  })
  // 6. list vector_layers missing vector_layer_displays
  const vectorLayersMissingDisplay = allVectorLayers.filter(
    (vl) =>
      !existingVectorLayerDisplays.some(
        (vld) => vld.vector_layer_id === vl.vector_layer_id,
      ),
  )
  // 7. create missing vector_layer_displays
  const newVectorLayerDisplays = vectorLayersMissingDisplay.map((vl) =>
    createVectorLayerDisplay({
      vector_layer_id: vl.vector_layer_id,
    }),
  )
  if (newVectorLayerDisplays.length) {
    await db.vector_layer_displays.createMany({
      data: newVectorLayerDisplays,
    })
  }

  return true
}
