import { vectorLayerTables } from './upsertTableVectorLayersForProject'

export const updateTableVectorLayerLabels = async ({ db, project_id }) => {
  const placeLevels = await db.place_levels.findMany({
    where: {
      deleted: false,
      project_id,
    },
  })
  const tableVectorLayers = await db.vector_layers.findMany({
    where: {
      project_id,
      deleted: false,
      type: { in: vectorLayerTables },
    },
  })
  // loop allVectorLayers and update label using placeLevels
  for (const vl of tableVectorLayers) {
    const level = vl.type.slice(-1)
    const placeLevel = placeLevels.find((pl) => pl.level == level)
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
}
