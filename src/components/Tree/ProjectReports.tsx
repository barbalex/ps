import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { ProjectReportNode } from './ProjectReport.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom, projectReportsFilterAtom } from '../../store.ts'

interface Props {
  project_id: string
  level?: number
}

export const ProjectReportsNode = memo(({ project_id, level = 3 }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [filter] = useAtom(projectReportsFilterAtom)

  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const where = filter.length > 1 ? { OR: filter } : filter[0]
  const { results: projectReports = [] } = useLiveQuery(
    db.project_reports.liveMany({
      where: { project_id, ...where },
      orderBy: { label: 'asc' },
    }),
  )
  const { results: projectReportsUnfiltered = [] } = useLiveQuery(
    db.project_reports.liveMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered = projectReports.length !== projectReportsUnfiltered.length

  const projectReportsNode = useMemo(
    () => ({
      label: `Reports (${
        isFiltered
          ? `${projectReports.length}/${projectReportsUnfiltered.length}`
          : projectReports.length
      })`,
    }),
    [isFiltered, projectReports.length, projectReportsUnfiltered.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(
    () => ['data', 'projects', project_id],
    [project_id],
  )
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(() => [...parentArray, 'reports'], [parentArray])
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
        node={projectReportsNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={projectReports.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        projectReports.map((projectReport) => (
          <ProjectReportNode
            key={projectReport.project_report_id}
            project_id={project_id}
            projectReport={projectReport}
          />
        ))}
    </>
  )
})
