import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import {
  useLiveQuery,
  useLiveIncrementalQuery,
} from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { ProjectNode } from './Project/index.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom, projectsFilterAtom } from '../../store.ts'
import { filterStringFromFilter } from '../../modules/filterStringFromFilter.ts'

export const ProjectsNode = memo(() => {
  const [filter] = useAtom(projectsFilterAtom)
  const isFiltered = filter.length > 0
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const filterString = filterStringFromFilter(filter)
  const resultFiltered = useLiveIncrementalQuery(
    `
    SELECT
      project_id,
      files_active_projects,
      label
    FROM projects
    ${filterString ? ` WHERE ${filterString}` : ''} 
    ORDER BY label`,
    undefined,
    'project_id',
  )
  const projects = resultFiltered?.rows ?? []
  const projectsLoading = resultFiltered === undefined

  const resultCountUnfiltered = useLiveQuery(`SELECT count(*) FROM projects`)
  const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0
  const countLoading = resultCountUnfiltered === undefined

  const node = useMemo(
    () => ({
      label: `Projects (${
        isFiltered
          ? `${projectsLoading ? '...' : projects.length}/${
              countLoading ? '...' : countUnfiltered
            }`
          : projectsLoading
          ? '...'
          : projects.length
      })`,
    }),
    [
      isFiltered,
      projectsLoading,
      projects.length,
      countLoading,
      countUnfiltered,
    ],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(() => ['data'], [])
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(() => [...parentArray, 'projects'], [parentArray])
  const ownUrl = `/${ownArray.join('/')}`

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: ownArray,
        isRoot: true,
      })
      // only navigate if urlPath includes ownArray
      if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
        navigate({ pathname: parentUrl, search: searchParams.toString() })
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
        node={node}
        level={1}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={projects.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        projects.map((project) => (
          <ProjectNode
            key={project.project_id}
            project={project}
          />
        ))}
    </>
  )
})
