import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { WmsLayerNode } from './WmsLayer.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom, wmsLayersFilterAtom } from '../../store.ts'

interface Props {
  project_id: string
  level?: number
}

export const WmsLayersNode = memo(({ project_id, level = 3 }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [filter] = useAtom(wmsLayersFilterAtom)
  const isFiltered = !!filter

  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const resultFiltered = useLiveQuery(
    `SELECT * FROM wms_layers WHERE project_id = $1${
      isFiltered ? ` AND (${filter})` : ''
    } order by label asc`,
    [project_id],
  )
  const wmsLayers = resultFiltered?.rows ?? []

  const resultCountUnfiltered = useLiveQuery(
    `SELECT count(*) FROM wms_layers WHERE project_id = $1`,
    [project_id],
  )
  const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0

  const wmsLayersNode = useMemo(
    () => ({
      label: `WMS Layers (${
        isFiltered ? `${wmsLayers.length}/${countUnfiltered}` : wmsLayers.length
      })`,
    }),
    [isFiltered, wmsLayers.length, countUnfiltered],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(
    () => ['data', 'projects', project_id],
    [project_id],
  )
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(() => [...parentArray, 'wms-layers'], [parentArray])
  const ownUrl = `/${ownArray.join('/')}`

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({ node: ownArray })
      // only navigate if urlPath includes ownArray
      if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
        navigate({
          pathname: parentUrl,
          search: searchParams.toString(),
        })
      }
      return
    }
    // add to openNodes without navigating
    addOpenNodes({ nodes: [ownArray] })
  }, [
    isInActiveNodeArray,
    isOpen,
    navigate,
    ownArray,
    parentArray,
    parentUrl,
    searchParams,
    urlPath.length,
  ])

  return (
    <>
      <Node
        node={wmsLayersNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={wmsLayers.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        wmsLayers.map((wmsLayer) => (
          <WmsLayerNode
            key={wmsLayer.wms_layer_id}
            project_id={project_id}
            wmsLayer={wmsLayer}
          />
        ))}
    </>
  )
})
