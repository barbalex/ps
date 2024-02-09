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

export const addVectorLayersForProject = async ({ db, project_id }) => {
  const vectorLayers = tables.map((table) =>
    createVectorLayer({
      project_id,
      type: table,
      label: `${table.charAt(0).toUpperCase()}${table
        .substring(0, table.length - 1)
        .slice(1)} of level ${table.slice(-1)}`,
    }),
  )
  await db.vector_layers.createMany({
    data: vectorLayers,
  })
  const vectorLayerDisplays = vectorLayers.map((vl) =>
    createVectorLayerDisplay({
      data_table: vl.type,
      vector_layer_id: vl.vector_layer_id,
    }),
  )
  await db.vector_layer_displays.createMany({
    data: vectorLayerDisplays,
  })
  return true
}
