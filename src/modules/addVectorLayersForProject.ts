import { createVectorLayer, createVectorLayerDisplay } from './createRows'
const tables = [
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
  const { results: existingVectorLayers = [] } =
    await db.vector_layers.findMany({
      where: { project_id, deleted: false, type: { in: tables } },
    })
  // 2. list tables missing vector_layers:
  const missingVectorLayerTables = existingVectorLayers.filter(
    (table) =>
      !existingVectorLayers.some(
        (vl) => vl.type === table && vl.project_id === project_id,
      ),
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
    await db.vector_layers.createMany({
      data: newVectorLayers,
    })
  }
  // 4. TODO: update vector_layer labels using place_levels

  // 5. check if vector_layer_displays exist for this project
  const { results: vectorLayers = [] } = await db.vector_layers.findMany({
    where: { project_id, deleted: false, type: { in: tables } },
  })
  const { results: existingVectorLayerDisplays = [] } =
    await db.vector_layer_displays.findMany({
      where: {
        vector_layer_id: { in: vectorLayers.map((vl) => vl.vector_layer_id) },
      },
    })
  // 6. list vector_layers missing vector_layer_displays
  const vectorLayersMissingDisplay = vectorLayers.filter(
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
