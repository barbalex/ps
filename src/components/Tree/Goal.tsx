import { useLocation, useNavigate } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { Node } from './Node.tsx'
import { GoalReportsNode } from './GoalReports.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

export const GoalNode = ({ projectId, subprojectId, nav, level = 6 }) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const { formatMessage } = useIntl()
  const location = useLocation()
  const navigate = useNavigate()

  const res = useLiveQuery(
    `SELECT p.goal_reports_in_goal
      FROM goals g
      INNER JOIN subprojects sp ON sp.subproject_id = g.subproject_id
      INNER JOIN projects p ON p.project_id = sp.project_id
      WHERE g.goal_id = $1`,
    [nav.id],
  )
  const goalReportsInGoal = res?.rows?.[0]?.goal_reports_in_goal !== false
  const showReportsNav = !goalReportsInGoal

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'goals',
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, nav.id]
  const ownUrl = `/${ownArray.join('/')}`

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = goalReportsInGoal ? isInActiveNodeArray : isEqual(urlPath, ownArray)

  const onClickButton = () => {
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
  }

  return (
    <>
      <Node
        label={nav.label}
        id={nav.id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={goalReportsInGoal ? 0 : showReportsNav ? 2 : 1}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen && !goalReportsInGoal && (
        <>
          <Node
            label={formatMessage({ id: 'Ikw+kl', defaultMessage: 'Ziel' })}
            level={level + 1}
            isInActiveNodeArray={
              ownArray.every((part, i) => urlPath[i] === part) &&
              urlPath[ownArray.length] === 'goal'
            }
            isActive={isEqual(urlPath, [...ownArray, 'goal'])}
            to={`${ownUrl}/goal`}
          />
          {showReportsNav && (
            <GoalReportsNode
              projectId={projectId}
              subprojectId={subprojectId}
              goalId={nav.id}
            />
          )}
        </>
      )}
    </>
  )
}
