import { addOperationAtom, store, pgliteDbAtom, languageAtom } from '../store.ts'
import { getOwnLayerLabels } from './ownLayerLabels.ts'

export const updateTableVectorLayerLabels = async ({ project_id }) => {
  const db = store.get(pgliteDbAtom)
  const language = store.get(languageAtom)
  const labels = getOwnLayerLabels(language)
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
    const level = vl.own_table_level
    const placeLevel = placeLevels.find((pl) => pl.level == level)
    let label

    switch (vl.own_table) {
      case 'places':
        label = placeLevel?.[`name_plural_${language}`] ?? labels.placesLabel
        break
      case 'actions':
        label = placeLevel?.[`name_singular_${language}`]
          ? labels.actionsByPlaceLabel(placeLevel[`name_singular_${language}`])
          : labels.actionsLabel
        break
      case 'checks':
        label = placeLevel?.[`name_singular_${language}`]
          ? labels.checksByPlaceLabel(placeLevel[`name_singular_${language}`])
          : labels.checksLabel
        break
      case 'observations_assigned':
        label = placeLevel?.[`name_singular_${language}`]
          ? labels.observationsAssignedByPlaceLabel(
              placeLevel[`name_singular_${language}`],
            )
          : labels.observationsAssignedLabel
        break
      case 'observations_assigned_lines':
        label = placeLevel?.[`name_singular_${language}`]
          ? labels.observationsAssignedLinesLabel(
              placeLevel[`name_singular_${language}`],
            )
          : labels.observationsAssignedLinesLabel(labels.placesLabel)
        break
      case 'observations_to_assess':
        label = labels.observationsToAssessLabel
        break
      case 'observations_not_to_assign':
        label = labels.observationsNotToAssignLabel
        break
    }

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
