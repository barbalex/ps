import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { SubprojectReportNode } from './SubprojectReport.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom, subprojectReportsFilterAtom } from '../../store.ts'

interface Props {
  project_id: string
  subproject_id: string
  level?: number
}

export const SubprojectReportsNode = memo(
  ({ project_id, subproject_id, level = 5 }: Props) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const [filter] = useAtom(subprojectReportsFilterAtom)

    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const db = usePGlite()

    const where = filter.length > 1 ? { OR: filter } : filter[0]
    const { results: subprojectReports = [] } = useLiveQuery(
      db.subproject_reports.liveMany({
        where: { subproject_id, ...where },
        orderBy: { label: 'asc' },
      }),
    )
    const { results: subprojectReportsUnfiltered = [] } = useLiveQuery(
      db.subproject_reports.liveMany({
        where: { subproject_id },
        orderBy: { label: 'asc' },
      }),
    )
    const isFiltered =
      subprojectReports.length !== subprojectReportsUnfiltered.length

    const subprojectReportsNode = useMemo(
      () => ({
        label: `Reports (${
          isFiltered
            ? `${subprojectReports.length}/${subprojectReportsUnfiltered.length}`
            : subprojectReports.length
        })`,
      }),
      [
        isFiltered,
        subprojectReports.length,
        subprojectReportsUnfiltered.length,
      ],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => ['data', 'projects', project_id, 'subprojects', subproject_id],
      [project_id, subproject_id],
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
          node={subprojectReportsNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={subprojectReports.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          subprojectReports.map((subprojectReport) => (
            <SubprojectReportNode
              key={subprojectReport.subproject_report_id}
              project_id={project_id}
              subproject_id={subproject_id}
              subprojectReport={subprojectReport}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
