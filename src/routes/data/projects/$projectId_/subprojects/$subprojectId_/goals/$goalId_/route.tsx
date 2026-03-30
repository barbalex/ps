import { createFileRoute, Outlet, useLocation, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { GoalWithReports } from '../../../../../../../../formsAndLists/goal/WithReports.tsx'

const goalFrom =
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_'

const GoalLayout = () => {
  const { projectId, subprojectId, goalId } = useParams({ strict: false })
  const location = useLocation()
  const res = useLiveQuery(
    `SELECT p.goal_reports_in_goal
      FROM goals g
      INNER JOIN subprojects sp ON sp.subproject_id = g.subproject_id
      INNER JOIN projects p ON p.project_id = sp.project_id
      WHERE g.goal_id = $1`,
    [goalId],
  )
  const goalReportsInGoal = res?.rows?.[0]?.goal_reports_in_goal !== false

  const baseUrl = `/data/projects/${projectId}/subprojects/${subprojectId}/goals/${goalId}`
  const isBaseRoute =
    location.pathname === baseUrl || location.pathname === `${baseUrl}/`
  const isGoalRoute = location.pathname === `${baseUrl}/goal`
  const isReportsRoute =
    location.pathname === `${baseUrl}/reports` ||
    location.pathname.startsWith(`${baseUrl}/reports/`)

  if (
    goalReportsInGoal &&
    (isBaseRoute || isGoalRoute || isReportsRoute)
  ) {
    return <GoalWithReports from={goalFrom} />
  }
  return <Outlet />
}

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_',
)({
  component: GoalLayout,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.subprojectId || params.subprojectId === 'undefined') {
      throw new Error('Invalid or missing subprojectId in route parameters')
    }
    if (!params.goalId || params.goalId === 'undefined') {
      throw new Error('Invalid or missing goalId in route parameters')
    }
    return {
      navDataFetcher: 'useGoalNavData',
    }
  },
})
