import { createVectorLayer, createVectorLayerDisplay } from './createRows'
import { updateTableVectorLayerLabels } from './updateTableVectorLayerLabels'

export const vectorLayerTables = [
  'places1',
  'places2',
  'actions1',
  'actions2',
  'checks1',
  'checks2',
  'observations1',
  'observations2',
]

export const upsertVectorLayersForProject = async ({ db, project_id }) => {
  // 1. check if vector_layers exist for this project
  const existingVectorLayers = await db.vector_layers.findMany({
    where: { project_id, deleted: false, type: { in: vectorLayerTables } },
  })
  // 2. list tables missing vector_layers:
  const missingVectorLayerTables = vectorLayerTables.filter(
    (table) => !existingVectorLayers.some((vl) => vl.type === table),
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
      data_table: vl.type,
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
