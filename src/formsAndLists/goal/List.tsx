import { useParams } from '@tanstack/react-router'

import { useGoalNavData } from '../../modules/useGoalNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'
import { NotFound } from '../../components/NotFound.tsx'

export const GoalList = ({}: { from: string }) => {
  const { projectId, subprojectId, goalId } = useParams({ strict: false })
  const { loading, navData } = useGoalNavData({
    projectId: projectId!,    subprojectId: subprojectId!,    goalId: goalId!,  })
  const { navs, notFound } = navData

  if (notFound) {
    return (
      <NotFound
        table="Goal"
        id={goalId}
      />
    )
  }

  return (
    <div className="list-view">
      <Header />
      <div className="list-container">
        {loading ?
          <Loading />
        : navs.map((nav) => (
            <Row
              key={nav.id}
              label={nav.label}
              to={nav.id}
            />
          ))
        }
      </div>
    </div>
  )
}
