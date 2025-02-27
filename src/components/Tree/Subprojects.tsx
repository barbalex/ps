import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
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
import { treeOpenNodesAtom, subprojectsFilterAtom } from '../../store.ts'

interface Props {
  project_id: string
  level?: number
}

export const SubprojectsNode = memo(({ project_id, level = 3 }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [filter] = useAtom(subprojectsFilterAtom)
  const isFiltered = !!filter

  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const resultFiltered = useLiveIncrementalQuery(
    `
      SELECT subprojects.*, projects.subproject_name_plural 
      FROM subprojects 
        inner join projects on projects.project_id = subprojects.project_id 
      WHERE projects.project_id = $1${
        isFiltered ? ` AND (${filter})` : ''
      } order by label asc
      `,
    [project_id],
    'subproject_id',
  )
  const subprojects = resultFiltered?.rows ?? []

  const resultCountUnfiltered = useLiveQuery(
    `SELECT count(*) FROM subprojects WHERE project_id = $1`,
    [project_id],
  )
  const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0

  const namePlural = subprojects?.[0]?.subproject_name_plural ?? 'Subprojects'

  const subprojectsNode = useMemo(
    () => ({
      label: `${namePlural} (${
        isFiltered
          ? `${subprojects.length}/${countUnfiltered}`
          : subprojects.length
      })`,
    }),
    [isFiltered, namePlural, subprojects.length, countUnfiltered],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(
    () => ['data', 'projects', project_id],
    [project_id],
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

  // prevent flash of different name that happens before namePlural is set
  if (!namePlural) return null

  return (
    <>
      <Node
        node={subprojectsNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={subprojects.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        subprojects.map((subproject) => (
          <SubprojectNode
            key={subproject.subproject_id}
            project_id={project_id}
            subproject={subproject}
          />
        ))}
    </>
  )
})
