import { useCallback, useMemo, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createActionReportValue } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const FormHeaderComponent = memo(({ autoFocusRef }) => {
  const {
    project_id,
    subproject_id,
    place_id,
    place_id2,
    action_id,
    action_report_id,
    action_report_value_id,
  } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()

  const baseUrl = useMemo(
    () =>
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/actions/${action_id}/reports/${action_report_id}/values`,
    [
      action_id,
      action_report_id,
      place_id,
      place_id2,
      project_id,
      subproject_id,
    ],
  )

  const addRow = useCallback(async () => {
    const actionReportValue = createActionReportValue()
    await db.action_report_values.create({
      data: {
        ...actionReportValue,
        action_report_id,
      },
    })
    navigate(`${baseUrl}/${actionReportValue.action_report_value_id}`)
    autoFocusRef.current?.focus()
  }, [
    action_report_id,
    autoFocusRef,
    baseUrl,
    db.action_report_values,
    navigate,
  ])

  const deleteRow = useCallback(async () => {
    await db.action_report_values.delete({
      where: {
        action_report_value_id,
      },
    })
    navigate(baseUrl)
  }, [action_report_value_id, baseUrl, db.action_report_values, navigate])

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
    navigate(`${baseUrl}/${next.action_report_value_id}`)
  }, [
    action_report_id,
    action_report_value_id,
    baseUrl,
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
    navigate(`${baseUrl}/${previous.action_report_value_id}`)
  }, [
    action_report_id,
    action_report_value_id,
    baseUrl,
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
