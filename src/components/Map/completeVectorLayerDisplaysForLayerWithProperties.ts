// receives vector_layer_id and new properties
// fetches vector_layer_displays for vector_layer_id
// removes no more needed vector_layer_displays
// adds missing vector_layer_displays
import { store, pgliteDbAtom } from '../../store.ts'

// TODO: not done, needed?
export const completeVectorLayerDisplaysForLayerWithProperties = async ({
  vectorLayerId,
  properties,
}) => {
  const db = store.get(pgliteDbAtom)
  const vectorLayerDisplays = await db.query(
    `SELECT * FROM vector_layer_displays WHERE vector_layer_id = $1`,
    [vectorLayerId],
  )
  // console.log(
  //   'completeVectorLayerDisplaysForLayerWithProperties, vectorLayerDisplays:',
  //   vectorLayerDisplays,
  // )
  // if !vectorLayer.display_by_property: ensure single display

  // if vectorLayer.display_by_property:
  // if vectorLayer.display_by_property in properties: ensure displays for all properties
  // if not in properties: remove display and create single display
}
