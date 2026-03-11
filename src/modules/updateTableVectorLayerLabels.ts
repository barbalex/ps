import { addOperationAtom, store, pgliteDbAtom, languageAtom } from '../store.ts'

export const updateTableVectorLayerLabels = async ({ project_id }) => {
  const db = store.get(pgliteDbAtom)
  const language = store.get(languageAtom)
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
          label = placeLevel[`name_plural_${language}`]
          break
        case 'actions':
          if (placeLevel[`name_singular_${language}`])
            label = `${placeLevel[`name_singular_${language}`]} actions`
          break
        case 'checks':
          if (placeLevel[`name_singular_${language}`])
            label = `${placeLevel[`name_singular_${language}`]} checks`
          break
        case 'observations_assigned':
          if (placeLevel[`name_singular_${language}`])
            label = `${placeLevel[`name_singular_${language}`]} observations assigned`
          break
        case 'observations_assigned_lines':
          if (placeLevel[`name_singular_${language}`])
            label = `${placeLevel[`name_singular_${language}`]} observation assignments lines`
          break
      }
      // if label is different, update it
      if (label && label !== vl.label) {
        const vlPrevRes = await db.query(
          `SELECT * FROM vector_layers WHERE vector_layer_id = $1`,
          [vl.vector_layer_id],
        )
        const prev = vlPrevRes?.rows?.[0]
        await db.query(
          `UPDATE vector_layers SET label = $1 WHERE vector_layer_id = $2`,
          [label, vl.vector_layer_id],
        )
        store.set(addOperationAtom, {
          table: 'vector_layers',
          rowIdName: 'vector_layer_id',
          rowId: vl.vector_layer_id,
          operation: 'update',
          draft: { label },
          prev,
        })
      }
    }
  }
}
