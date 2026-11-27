import { ActiveLayers } from './Actives/index.tsx'
import { useParams } from '@tanstack/react-router'
import { ProjectAreaFilter } from '../../../shared/ProjectAreaFilter.tsx'
import { WmsLayers } from './WMS/index.tsx'
import { TileLayers } from './Tile/index.tsx'
import { VectorLayers } from './Vector/index.tsx'
import { OwnLayers } from './Own/index.tsx'
import { BackgroundLayers } from './Background/index.tsx'
import './index.css'
import styles from '../Content.module.css'

export const Layers = () => {
  const { projectId } = useParams({ strict: false })
  return (
    <>
      {projectId && <ProjectAreaFilter projectId={projectId} className={styles.scopeField} />}
      <ActiveLayers />
      <WmsLayers />
      <TileLayers />
      <VectorLayers />
      <OwnLayers />
      <BackgroundLayers />
    </>
  )
}
