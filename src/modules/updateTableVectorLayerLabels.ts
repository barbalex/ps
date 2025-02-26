export const updateTableVectorLayerLabels = async ({ db, project_id }) => {
  const plRes = await db.query(
    `SELECT * FROM place_levels WHERE project_id = $1`,
    [project_id],
  )
  const placeLevels = plRes?.rows ?? []
  const tVLRes = await db.query(
    `SELECT * FROM vector_layers WHERE project_id = $1 AND type = 'own'`,
    [project_id],
  )
  const tableVectorLayers = tVLRes?.rows ?? []
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
        await db.query(
          `UPDATE vector_layers SET label = $1 WHERE vector_layer_id = $2`,
          [label, vl.vector_layer_id],
        )
      }
    }
  }
}
