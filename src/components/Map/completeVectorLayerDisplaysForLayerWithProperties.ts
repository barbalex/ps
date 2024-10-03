// receives vector_layer_id and new properties
// fetches vector_layer_displays for vector_layer_id
// removes no more needed vector_layer_displays
// adds missing vector_layer_displays
import { Electric } from '../../generated/client.ts'

type Props = {
  vectorLayerId: string
  properties: string[]
  db: Electric
}

export const completeVectorLayerDisplaysForLayerWithProperties = async ({
  vectorLayerId,
  properties,
  db,
}: Props) => {
  console.log('completeVectorLayerDisplaysForLayerWithProperties', {
    vectorLayerId,
    properties,
  })
  const vectorLayerDisplays = await db.vector_layer_displays.findMany({
    where: { vector_layer_id: vectorLayerId },
  })
  console.log(
    'completeVectorLayerDisplaysForLayerWithProperties, vectorLayerDisplays:',
    vectorLayerDisplays,
  )
  // if !vectorLayer.display_by_property: ensure single display

  // if vectorLayer.display_by_property:
  // if vectorLayer.display_by_property in properties: ensure displays for all properties
  // if not in properties: remove display and create single display
}
