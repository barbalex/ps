import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import {
  useLiveQuery,
  useLiveIncrementalQuery,
} from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { SubprojectNode } from './Subproject.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { filterStringFromFilter } from '../../modules/filterStringFromFilter.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import { treeOpenNodesAtom, subprojectsFilterAtom } from '../../store.ts'

interface Props {
  projectId: string
  level?: number
}

export const SubprojectsNode = memo(({ projectId, level = 3 }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [filter] = useAtom(subprojectsFilterAtom)

  const location = useLocation()
  const navigate = useNavigate()

  const filterString = filterStringFromFilter(filter, 'subprojects')
  const isFiltered = !!filterString
  const sql = `
    SELECT 
      subprojects.subproject_id,
      subprojects.label, 
      projects.subproject_name_plural 
    FROM subprojects 
      inner join projects on projects.project_id = subprojects.project_id 
    WHERE 
      projects.project_id = $1
      ${isFiltered ? ` AND ${filterString}` : ''} 
    ORDER BY label
    `
  const resFiltered = useLiveIncrementalQuery(sql, [projectId], 'subproject_id')
  const rows = resFiltered?.rows ?? []
  const rowsLoading = resFiltered === undefined

  const resultCountUnfiltered = useLiveQuery(
    `SELECT count(*) FROM subprojects WHERE project_id = $1`,
    [projectId],
  )
  const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0
  const countLoading = resultCountUnfiltered === undefined

  const namePlural = rows?.[0]?.subproject_name_plural ?? 'Subprojects'

  const node = useMemo(
    () => ({
      label: `${namePlural} (${
        isFiltered ?
          `${rowsLoading ? '...' : formatNumber(rows.length)}/${
            countLoading ? '...' : formatNumber(countUnfiltered)
          }`
        : rowsLoading ? '...'
        : formatNumber(rows.length)
      })`,
    }),
    [
      namePlural,
      isFiltered,
      rowsLoading,
      rows.length,
      countLoading,
      countUnfiltered,
    ],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(
    () => ['data', 'projects', projectId],
    [projectId],
  )
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(() => [...parentArray, 'subprojects'], [parentArray])
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
        navigate({ to: parentUrl })
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
    urlPath.length,
  ])

  // prevent flash of different name that happens before namePlural is set
  if (!namePlural) return null

  return (
    <>
      <Node
        node={node}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={rows.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        rows.map((subproject) => (
          <SubprojectNode
            key={subproject.subproject_id}
            projectId={projectId}
            subproject={subproject}
          />
        ))}
    </>
  )
})
