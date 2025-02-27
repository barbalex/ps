import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { PlaceLevelNode } from './PlaceLevel.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

interface Props {
  project_id: string
  level?: number
}

export const PlaceLevelsNode = memo(({ project_id, level = 3 }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const result = useLiveIncrementalQuery(
    `SELECT * FROM place_levels WHERE project_id = $1 ORDER BY label ASC`,
    [project_id],
    'place_level_id',
  )
  const placeLevels = result?.rows ?? []

  const placeLevelsNode = useMemo(
    () => ({ label: `Place Levels (${placeLevels.length})` }),
    [placeLevels.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(
    () => ['data', 'projects', project_id],
    [project_id],
  )
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(
    () => [...parentArray, 'place-levels'],
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
    parentUrl,
    searchParams,
    urlPath.length,
  ])

  return (
    <>
      <Node
        node={placeLevelsNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={placeLevels.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        placeLevels.map((placeLevel) => (
          <PlaceLevelNode
            key={placeLevel.place_level_id}
            project_id={project_id}
            placeLevel={placeLevel}
          />
        ))}
    </>
  )
})
