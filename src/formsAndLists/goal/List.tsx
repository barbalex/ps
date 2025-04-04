import { memo } from 'react'
import { useParams } from '@tanstack/react-router'

import { useGoalNavData } from '../../modules/useGoalNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'

export const GoalList = memo(({ from }) => {
  const { projectId,  subprojectId, goalId } = useParams({ from })
  const { loading, navData } = useGoalNavData({
    projectId,
    subprojectId,goalId
  })
  const { navs, label } = navData

  return (
    <div className="list-view">
      <Header
        from={from}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : <>
            {navs.map((nav) => (
              <Row
                key={nav.id}
                label={nav.label}
                to={nav.id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
