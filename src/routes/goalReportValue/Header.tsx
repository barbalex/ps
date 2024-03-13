import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createGoalReportValue } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { goal_report_id, goal_report_value_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const goalReportValue = createGoalReportValue()
    await db.goal_report_values.create({
      data: {
        ...goalReportValue,
        goal_report_id,
      },
    })
    navigate(`../${goalReportValue.goal_report_value_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db.goal_report_values, goal_report_id, navigate])

  const deleteRow = useCallback(async () => {
    await db.goal_report_values.delete({
      where: { goal_report_value_id },
    })
    navigate('..')
  }, [db.goal_report_values, goal_report_value_id, navigate])

  const toNext = useCallback(async () => {
    const goalReportValues = await db.goal_report_values.findMany({
      where: { deleted: false, goal_report_id },
      orderBy: { label: 'asc' },
    })
    const len = goalReportValues.length
    const index = goalReportValues.findIndex(
      (p) => p.goal_report_value_id === goal_report_value_id,
    )
    const next = goalReportValues[(index + 1) % len]
    navigate(`../${next.goal_report_value_id}`)
  }, [db.goal_report_values, goal_report_id, goal_report_value_id, navigate])

  const toPrevious = useCallback(async () => {
    const goalReportValues = await db.goal_report_values.findMany({
      where: { deleted: false, goal_report_id },
      orderBy: { label: 'asc' },
    })
    const len = goalReportValues.length
    const index = goalReportValues.findIndex(
      (p) => p.goal_report_value_id === goal_report_value_id,
    )
    const previous = goalReportValues[(index + len - 1) % len]
    navigate(`../${previous.goal_report_value_id}`)
  }, [db.goal_report_values, goal_report_id, goal_report_value_id, navigate])

  return (
    <FormHeader
      title="Goal Report Value"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="goal report value"
    />
  )
})
