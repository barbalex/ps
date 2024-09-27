import { memo } from 'react'

import { Vector_layer_displays as VectorLayerDisplay } from '../../../../../generated/client/index.ts'

type Props = {
  display: VectorLayerDisplay
}

export const Display = memo(({ display }: Props) => {
  return <>{`TODO: Display`}</>
})
