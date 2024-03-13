import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createActionReportValue } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { action_report_id, action_report_value_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const actionReportValue = createActionReportValue()
    await db.action_report_values.create({
      data: {
        ...actionReportValue,
        action_report_id,
      },
    })
    navigate(`../${actionReportValue.action_report_value_id}`)
    autoFocusRef.current?.focus()
  }, [action_report_id, autoFocusRef, db.action_report_values, navigate])

  const deleteRow = useCallback(async () => {
    await db.action_report_values.delete({
      where: {
        action_report_value_id,
      },
    })
    navigate('..')
  }, [action_report_value_id, db.action_report_values, navigate])

  const toNext = useCallback(async () => {
    const actionReportValues = await db.action_report_values.findMany({
      where: { deleted: false, action_report_id },
      orderBy: { label: 'asc' },
    })
    const len = actionReportValues.length
    const index = actionReportValues.findIndex(
      (p) => p.action_report_value_id === action_report_value_id,
    )
    const next = actionReportValues[(index + 1) % len]
    navigate(`../${next.action_report_value_id}`)
  }, [
    action_report_id,
    action_report_value_id,
    db.action_report_values,
    navigate,
  ])

  const toPrevious = useCallback(async () => {
    const actionReportValues = await db.action_report_values.findMany({
      where: { deleted: false, action_report_id },
      orderBy: { label: 'asc' },
    })
    const len = actionReportValues.length
    const index = actionReportValues.findIndex(
      (p) => p.action_report_value_id === action_report_value_id,
    )
    const previous = actionReportValues[(index + len - 1) % len]
    navigate(`../${previous.action_report_value_id}`)
  }, [
    action_report_id,
    action_report_value_id,
    db.action_report_values,
    navigate,
  ])

  return (
    <FormHeader
      title="Action Report Value"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="goal report value"
    />
  )
})
