import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { GoalReports as GoalReport } from '../../../generated/client'
import { createGoalReport } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { Jsonb } from '../components/shared/Jsonb'
import { FormHeader } from '../components/FormHeader'
// import { getValueFromChange } from '../modules/getValueFromChange'

import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, goal_id, goal_report_id } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.goal_reports.liveUnique({ where: { goal_report_id } }),
    [goal_report_id],
  )

  const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports`

  const addRow = useCallback(async () => {
    const data = await createGoalReport({ db, project_id, goal_id })
    await db.goal_reports.create({ data })
    navigate(`${baseUrl}/${data.goal_report_id}`)
    autoFocusRef.current?.focus()
  }, [baseUrl, db, goal_id, navigate, project_id])

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

  const row: GoalReport = results

  // console.log('goalReport', { row, goal_id })

  // const onChange = useCallback(
  //   (e, data) => {
  //     const { name, value } = getValueFromChange(e, data)
  //     db.goal_reports.update({
  //       where: { goal_report_id },
  //       data: { [name]: value },
  //     })
  //   },
  //   [db.goal_reports],
  // )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-outer-container">
      <FormHeader
        title="Goal Report"
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="goal report"
      />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="goal_report_id"
          value={row.goal_report_id ?? ''}
        />
        <Jsonb
          table="goal_reports"
          idField="goal_report_id"
          id={row.goal_report_id}
          data={row.data ?? {}}
          autoFocus
          ref={autoFocusRef}
        />
      </div>
    </div>
  )
}
