import { useParams, useNavigate } from '@tanstack/react-router'

import { createGoalReport } from '../modules/createRows.ts'
import { useGoalReportsNavData } from '../modules/useGoalReportsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const GoalReports = ({ hideHeader = false }) => {
  const { projectId, subprojectId, goalId } = useParams({ strict: false })
  const navigate = useNavigate()
  const reportsBaseUrl = `/data/projects/${projectId}/subprojects/${subprojectId}/goals/${goalId}/reports`

  const { loading, navData } = useGoalReportsNavData({
    projectId,
    subprojectId,
    goalId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createGoalReport({
      projectId,
      goalId,
    })

    if (!id) return

    navigate({ to: `${reportsBaseUrl}/${id}/` })
  }

  return (
    <div className="list-view">
      {!hideHeader && (
        <ListHeader
          label={label}
          nameSingular={nameSingular}
          addRow={add}
        />
      )}
      <div className="list-container">
        {loading ?
          <Loading />
        : navs.map(({ id, label }) => (
            <Row
              key={id}
              label={label ?? id}
              to={`${reportsBaseUrl}/${id}/`}
            />
          ))
        }
      </div>
    </div>
  )
}
