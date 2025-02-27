import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import {
  useLiveQuery,
  useLiveIncrementalQuery,
} from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { VectorLayerNode } from './VectorLayer.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom, vectorLayersFilterAtom } from '../../store.ts'

interface Props {
  project_id: string
  level?: number
}

export const VectorLayersNode = memo(({ project_id, level = 3 }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [filter] = useAtom(vectorLayersFilterAtom)
  const isFiltered = !!filter

  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const resultFiltered = useLiveIncrementalQuery(
    `SELECT * FROM vector_layers WHERE project_id = $1${
      isFiltered ? ` AND (${filter})` : ''
    } order by label asc`,
    [project_id],
    'vector_layer_id',
  )
  const vectorLayers = resultFiltered?.rows ?? []

  const resultCountUnfiltered = useLiveQuery(
    `SELECT count(*) FROM vector_layers WHERE project_id = $1`,
    [project_id],
  )
  const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0

  const vectorLayersNode = useMemo(
    () => ({
      label: `Vector Layers (${
        isFiltered
          ? `${vectorLayers.length}/${countUnfiltered}`
          : vectorLayers.length
      })`,
    }),
    [isFiltered, vectorLayers.length, countUnfiltered],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(
    () => ['data', 'projects', project_id],
    [project_id],
  )
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(
    () => [...parentArray, 'vector-layers'],
    [parentArray],
  )
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
        node={vectorLayersNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={vectorLayers.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        vectorLayers.map((vectorLayer) => (
          <VectorLayerNode
            key={vectorLayer.vector_layer_id}
            project_id={project_id}
            vectorLayer={vectorLayer}
          />
        ))}
    </>
  )
})
