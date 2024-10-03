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

export const updateVectorLayerDisplaysForLayerAndPropertyValues = async ({
  vectorLayerId,
  properties,
  db,
}: Props) => {
  console.log('updateVectorLayerDisplaysForLayerAndPropertyValues', {
    vectorLayerId,
    properties,
  })
  const vectorLayerDisplays = await db.vector_layer_displays.findMany({
    where: { vector_layer_id: vectorLayerId },
  })
  console.log(
    'updateVectorLayerDisplaysForLayerAndPropertyValues, vectorLayerDisplays:',
    vectorLayerDisplays,
  )
}
