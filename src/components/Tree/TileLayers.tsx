import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { TileLayerNode } from './TileLayer.tsx'

interface Props {
  project_id: string
  level?: number
}

export const TileLayersNode = memo(({ project_id, level = 3 }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: tileLayers = [] } = useLiveQuery(
    db.tile_layers.liveMany({
      where: { project_id },
      orderBy: [{ sort: 'asc' }, { label: 'asc' }],
    }),
  )

  const tileLayersNode = useMemo(
    () => ({ label: `Tile Layers (${tileLayers.length})` }),
    [tileLayers.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'tile-layers'
  const isActive = isOpen && urlPath.length === 3

  const baseUrl = `/projects/${project_id}`

  const onClickButton = useCallback(() => {
    if (isOpen) {
      return navigate({ pathname: baseUrl, search: searchParams.toString() })
    }
    navigate({
      pathname: `${baseUrl}/tile-layers`,
      search: searchParams.toString(),
    })
  }, [baseUrl, isOpen, navigate, searchParams])

  return (
    <>
      <Node
        node={tileLayersNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={tileLayers.length}
        to={`${baseUrl}/tile-layers`}
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
})
