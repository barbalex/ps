import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createGoalReport } from '../modules/createRows.ts'
import { useGoalReportsNavData } from '../modules/useGoalReportsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/'

export const GoalReports = () => {
  const { projectId, subprojectId, goalId } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData } = useGoalReportsNavData({
    projectId,
    subprojectId,
    goalId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const goalReportId = await createGoalReport({
      db,
      projectId,
      goalId,
    })

    if (!goalReportId) return

    navigate({
      to: goalReportId,
      params: (prev) => ({ ...prev, goalReportId }),
    })
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : <>
            {navs.map(({ id, label }) => (
              <Row
                key={id}
                label={label ?? id}
                to={id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
}
