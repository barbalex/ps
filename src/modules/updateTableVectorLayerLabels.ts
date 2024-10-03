export const updateTableVectorLayerLabels = async ({ db, project_id }) => {
  const placeLevels = await db.place_levels.findMany({
    where: { project_id },
  })
  const tableVectorLayers = await db.vector_layers.findMany({
    where: {
      project_id,
      type: 'own',
    },
  })
  // loop allVectorLayers and update label using placeLevels
  for (const vl of tableVectorLayers) {
    const level = vl.type.slice(-1)
    const placeLevel = placeLevels.find((pl) => pl.level == level)
    if (placeLevel) {
      let label
      switch (vl.own_table) {
        case 'places':
          label = placeLevel.name_plural
          break
        case 'actions':
          if (placeLevel.name_singular)
            label = `${placeLevel.name_singular} actions`
          break
        case 'checks':
          if (placeLevel.name_singular)
            label = `${placeLevel.name_singular} checks`
          break
        case 'occurrences_assigned':
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
