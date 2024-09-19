import { memo } from 'react'

import { ActiveLayers } from './Actives/index.tsx'
import { WmsLayers } from './WMS/index.tsx'
import { VectorLayers } from './Vector/index.tsx'
import { OwnLayers } from './Own.tsx'

export const Layers = memo(() => (
  <>
    <ActiveLayers />
    <WmsLayers />
    <VectorLayers />
    <OwnLayers />
  </>
))
