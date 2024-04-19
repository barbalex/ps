export const vectorLayerTables = [
  'places1',
  'places2',
  'actions1',
  'actions2',
  'checks1',
  'checks2',
  'occurrences_assigned1',
  'occurrences_assigned2',
  'occurrences_to_assess',
  'occurrences_not_to_assign',
]

export const updateTableVectorLayerLabels = async ({ db, project_id }) => {
  const placeLevels = await db.place_levels.findMany({
    where: { project_id },
  })
  const tableVectorLayers = await db.vector_layers.findMany({
    where: {
      project_id,
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
        case 'occurrences_assigned1':
        case 'occurrences_assigned2':
          if (placeLevel.name_singular)
            label = `${placeLevel.name_singular} occurrences assigned`
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
