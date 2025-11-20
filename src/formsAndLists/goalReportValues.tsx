import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createGoalReportValue } from '../modules/createRows.ts'
import { useGoalReportValuesNavData } from '../modules/useGoalReportValuesNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/values/'

export const GoalReportValues = () => {
  const { projectId, subprojectId, goalId, goalReportId } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData } = useGoalReportValuesNavData({
    projectId,
    subprojectId,
    goalId,
    goalReportId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const res = await createGoalReportValue({
      db,
      goalReportId,
    })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.goal_report_value_id,
      params: (prev) => ({
        ...prev,
        goalReportValueId: data.goal_report_value_id,
      }),
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
