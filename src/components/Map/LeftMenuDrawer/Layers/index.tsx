import { ActiveLayers } from './Actives/index.tsx'
import { WmsLayers } from './WMS/index.tsx'
import { VectorLayers } from './Vector/index.tsx'
import { OwnLayers } from './Own/index.tsx'
import './index.css'

export const Layers = () => (
  <>
    <ActiveLayers />
    <WmsLayers />
    <VectorLayers />
    <OwnLayers />
  </>
)
