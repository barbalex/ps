import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { Tile_layers as TileLayer } from '../../../generated/client'
import { TileLayerNode } from './TileLayer'

export const TileLayersNode = ({ project_id, level = 3 }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.tile_layers.liveMany({
      where: { deleted: false, project_id },
      orderBy: [{ sort: 'asc' }, { label: 'asc' }],
    }),
  )
  const tileLayers: TileLayer[] = results ?? []

  const tileLayersNode = useMemo(
    () => ({
      label: `Tile Layers (${tileLayers.length})`,
    }),
    [tileLayers.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'tile-layers'
  const isActive = isOpen && urlPath.length === 3

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(`/projects/${project_id}`)
    navigate(`/projects/${project_id}/tile-layers`)
  }, [isOpen, navigate, project_id])

  return (
    <>
      <Node
        node={tileLayersNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={tileLayers.length}
        to={`/projects/${project_id}/tile-layers`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        tileLayers.map((tileLayer) => (
          <TileLayerNode
            key={tileLayer.tile_layer_id}
            project_id={project_id}
            tileLayer={tileLayer}
          />
        ))}
    </>
  )
}
