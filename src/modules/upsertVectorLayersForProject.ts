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
  console.log(
    'hello upsertVectorLayersForProject, existingVectorLayers:',
    existingVectorLayers,
  )
  // 2. list tables missing vector_layers:
  const missingVectorLayerTables = tables.filter(
    (table) => !existingVectorLayers.some((vl) => vl.type === table),
  )
  console.log(
    'hello upsertVectorLayersForProject, missingVectorLayerTables:',
    missingVectorLayerTables,
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
  console.log(
    'hello upsertVectorLayersForProject, newVectorLayers:',
    newVectorLayers,
  )
  if (newVectorLayers.length) {
    await db.vector_layers.createMany({
      data: newVectorLayers,
    })
  }

  const allVectorLayers = [...existingVectorLayers, ...newVectorLayers]
  console.log(
    'hello upsertVectorLayersForProject, vectorLayers:',
    allVectorLayers,
  )
  // 4. TODO: update vector_layer labels using place_levels
  // need to fetch place_levels for this project

  const { results: placeLevels = [] } = await db.place_levels.findMany({
    where: {
      deleted: false,
      project_id,
    },
    orderBy: { label: 'asc' },
  })
  console.log('hello upsertVectorLayersForProject, placeLevels:', placeLevels)
  // loop allVectorLayers and update label using placeLevels
  for (const vl of allVectorLayers) {
    const level = vl.type.slice(-1)
    const placeLevel = placeLevels.find((pl) => pl.level === level)
    if (placeLevel) {
      let label
      switch (vl.type) {
        case 'places1':
        case 'places2':
          label = placeLevel.name_plural
          break
        case 'actions1':
        case 'actions2':
          if (placeLevel.name_singular)
            label = `${placeLevel.name_singular} actions`
          break
        case 'checks1':
        case 'checks2':
          if (placeLevel.name_singular)
            label = `${placeLevel.name_singular} checks`
          break
        case 'observations1':
        case 'observations2':
          if (placeLevel.name_singular)
            label = `${placeLevel.name_singular} observations`
          break
      }
      // if label is different, update it
      if (label && label !== vl.label) {
        await db.vector_layers.update({
          where: { vector_layer_id: vl.vector_layer_id },
          data: { label },
        })
      }
    }
  }

  // 5. check if vector_layer_displays exist for this project
  const { results: existingVectorLayerDisplays = [] } =
    await db.vector_layer_displays.findMany({
      where: {
        vector_layer_id: {
          in: allVectorLayers.map((vl) => vl.vector_layer_id),
        },
      },
    })
  console.log(
    'hello upsertVectorLayersForProject, existingVectorLayerDisplays:',
    existingVectorLayerDisplays,
  )
  // 6. list vector_layers missing vector_layer_displays
  const vectorLayersMissingDisplay = allVectorLayers.filter(
    (vl) =>
      !existingVectorLayerDisplays.some(
        (vld) => vld.vector_layer_id === vl.vector_layer_id,
      ),
  )
  console.log(
    'hello upsertVectorLayersForProject, vectorLayersMissingDisplay:',
    vectorLayersMissingDisplay,
  )
  // 7. create missing vector_layer_displays
  const newVectorLayerDisplays = vectorLayersMissingDisplay.map((vl) =>
    createVectorLayerDisplay({
      data_table: vl.type,
      vector_layer_id: vl.vector_layer_id,
    }),
  )
  console.log(
    'hello upsertVectorLayersForProject, newVectorLayerDisplays:',
    newVectorLayerDisplays,
  )
  if (newVectorLayerDisplays.length) {
    await db.vector_layer_displays.createMany({
      data: newVectorLayerDisplays,
    })
  }

  return true
}
