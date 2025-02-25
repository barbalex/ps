import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'

import { Node } from './Node.tsx'
import { GoalReportValueNode } from './GoalReportValue.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

interface Props {
  project_id: string
  subproject_id: string
  goal_id: string
  goal_report_id: string
  level?: number
}

export const GoalReportValuesNode = memo(
  ({
    project_id,
    subproject_id,
    goal_id,
    goal_report_id,
    level = 9,
  }: Props) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const res = useLiveQuery(
      `SELECT * FROM goal_report_values WHERE goal_report_id = $1 ORDER BY label asc`,
      [goal_report_id],
    )
    const goalReportValues = res?.rows ?? []

    const goalReportValuesNode = useMemo(
      () => ({ label: `Values (${goalReportValues.length})` }),
      [goalReportValues.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'subprojects',
        subproject_id,
        'goals',
        goal_id,
        'reports',
        goal_report_id,
      ],
      [goal_id, goal_report_id, project_id, subproject_id],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(() => [...parentArray, 'values'], [parentArray])
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
          node={goalReportValuesNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={goalReportValues.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          goalReportValues.map((goalReportValue) => (
            <GoalReportValueNode
              key={goalReportValue.goal_report_value_id}
              project_id={project_id}
              subproject_id={subproject_id}
              goal_id={goal_id}
              goal_report_id={goal_report_id}
              goalReportValue={goalReportValue}
            />
          ))}
      </>
    )
  },
)
