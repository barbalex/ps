import { useParams } from '@tanstack/react-router'

import { useGoalReportNavData } from '../../modules/useGoalReportNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'
import { NotFound } from '../../components/NotFound.tsx'

export const GoalReportList = ({ from }: { from: string }) => {
  const { projectId, subprojectId, goalId, goalReportId } = useParams({ strict: false })
  const { loading, navData } = useGoalReportNavData({
    projectId: projectId!,    subprojectId: subprojectId!,    goalId: goalId!,    goalReportId: goalReportId!,  })
  const { navs, notFound } = navData

  if (notFound) {
    return (
      <NotFound
        table="Goal Report"
        id={goalReportId}
      />
    )
  }

  return (
    <div className="list-view">
      <Header from={from} />
      <div className="list-container">
        {loading ?
          <Loading />
        : (navs as { id: string; label: string | null }[]).map((nav) => (
            <Row
              key={nav.id}
              label={nav.label as string}
              to={nav.id}
            />
          ))
        }
      </div>
    </div>
  )
}
