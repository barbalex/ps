import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createGoalReport } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, subproject_id, goal_id, goal_report_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()

  const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports`

  const addRow = useCallback(async () => {
    const data = await createGoalReport({ db, project_id, goal_id })
    await db.goal_reports.create({ data })
    navigate(`${baseUrl}/${data.goal_report_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, baseUrl, db, goal_id, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.goal_reports.delete({
      where: {
        goal_report_id,
      },
    })
    navigate(baseUrl)
  }, [baseUrl, db.goal_reports, goal_report_id, navigate])

  const toNext = useCallback(async () => {
    const goalReports = await db.goal_reports.findMany({
      where: { deleted: false, goal_id },
      orderBy: { label: 'asc' },
    })
    const len = goalReports.length
    const index = goalReports.findIndex(
      (p) => p.goal_report_id === goal_report_id,
    )
    const next = goalReports[(index + 1) % len]
    navigate(`${baseUrl}/${next.goal_report_id}`)
  }, [baseUrl, db.goal_reports, goal_id, goal_report_id, navigate])

  const toPrevious = useCallback(async () => {
    const goalReports = await db.goal_reports.findMany({
      where: { deleted: false, goal_id },
      orderBy: { label: 'asc' },
    })
    const len = goalReports.length
    const index = goalReports.findIndex(
      (p) => p.goal_report_id === goal_report_id,
    )
    const previous = goalReports[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.goal_report_id}`)
  }, [baseUrl, db.goal_reports, goal_id, goal_report_id, navigate])

  return (
    <FormHeader
      title="Goal Report"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="goal report"
    />
  )
})
