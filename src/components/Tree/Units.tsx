import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import {
  useLiveQuery,
  useLiveIncrementalQuery,
} from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { UnitNode } from './Unit.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom, unitsFilterAtom } from '../../store.ts'
import { filterStringFromFilter } from '../../modules/filterStringFromFilter.ts'

interface Props {
  project_id: string
  level?: number
}

export const UnitsNode = memo(({ project_id, level = 3 }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [filter] = useAtom(unitsFilterAtom)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString
  const resultFiltered = useLiveIncrementalQuery(
    `
    SELECT
      unit_id,
      label
    FROM units 
    WHERE 
      project_id = $1
      ${isFiltered ? ` AND ${filterString}` : ''} 
    ORDER BY label`,
    [project_id],
    'unit_id',
  )
  const units = resultFiltered?.rows ?? []
  const unitsLoading = resultFiltered === undefined

  const resultCountUnfiltered = useLiveQuery(
    `SELECT count(*) FROM units WHERE project_id = $1`,
    [project_id],
  )
  const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0
  const countLoading = resultCountUnfiltered === undefined

  const unitsNode = useMemo(
    () => ({
      label: `Units (${
        isFiltered
          ? `${unitsLoading ? '...' : units.length}/${
              countLoading ? '...' : countUnfiltered
            }`
          : unitsLoading
          ? '...'
          : units.length
      })`,
    }),
    [isFiltered, unitsLoading, units.length, countLoading, countUnfiltered],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(
    () => ['data', 'projects', project_id],
    [project_id],
  )
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(() => [...parentArray, 'units'], [parentArray])
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
        node={unitsNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={units.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        units.map((unit) => (
          <UnitNode
            key={unit.unit_id}
            project_id={project_id}
            unit={unit}
          />
        ))}
    </>
  )
})
