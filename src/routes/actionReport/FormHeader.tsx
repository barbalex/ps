import { useCallback, useMemo, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createActionReport } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

import '../../form.css'

export const FormHeaderComponent = memo(({ autoFocusRef }) => {
  const {
    project_id,
    subproject_id,
    place_id,
    place_id2,
    action_id,
    action_report_id,
  } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()

  const baseUrl = useMemo(
    () =>
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/actions/${action_id}/reports`,
    [action_id, place_id, place_id2, project_id, subproject_id],
  )

  const addRow = useCallback(async () => {
    const data = await createActionReport({
      db,
      project_id,
      action_id,
    })
    await db.action_reports.create({ data })
    navigate(`${baseUrl}/${data.action_report_id}`)
    autoFocusRef.current?.focus()
  }, [action_id, autoFocusRef, baseUrl, db, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.action_reports.delete({
      where: {
        action_report_id,
      },
    })
    navigate(baseUrl)
  }, [action_report_id, baseUrl, db.action_reports, navigate])

  const toNext = useCallback(async () => {
    const actionReports = await db.action_reports.findMany({
      where: { deleted: false, action_id },
      orderBy: { label: 'asc' },
    })
    const len = actionReports.length
    const index = actionReports.findIndex(
      (p) => p.action_report_id === action_report_id,
    )
    const next = actionReports[(index + 1) % len]
    navigate(`${baseUrl}/${next.action_report_id}`)
  }, [action_id, action_report_id, baseUrl, db.action_reports, navigate])

  const toPrevious = useCallback(async () => {
    const actionReports = await db.action_reports.findMany({
      where: { deleted: false, action_id },
      orderBy: { label: 'asc' },
    })
    const len = actionReports.length
    const index = actionReports.findIndex(
      (p) => p.action_report_id === action_report_id,
    )
    const previous = actionReports[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.action_report_id}`)
  }, [action_id, action_report_id, baseUrl, db.action_reports, navigate])

  return (
    <FormHeader
      title="Action Report"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="goal report value"
    />
  )
})
