import { useCallback, useMemo, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { ActionReports as ActionReport } from '../../../generated/client'
import { createActionReport } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { Jsonb } from '../components/shared/Jsonb'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormHeader } from '../components/FormHeader'

import '../form.css'

export const Component = () => {
  const {
    project_id,
    subproject_id,
    place_id,
    place_id2,
    action_id,
    action_report_id,
  } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.action_reports.liveUnique({ where: { action_report_id } }),
    [action_report_id],
  )

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
  }, [action_id, baseUrl, db, navigate, project_id])

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

  const row: ActionReport = results

  // console.log('ActionReport', { row, results })

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.action_reports.update({
        where: { action_report_id },
        data: { [name]: value },
      })
    },
    [db.action_reports, action_report_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <>
      <FormHeader
        title="Action Report"
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="goal report value"
      />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="action_report_id"
          value={row.action_report_id ?? ''}
        />
        <TextField
          label="Year"
          name="year"
          value={row.year ?? ''}
          type="number"
          onChange={onChange}
        />
        <Jsonb
          table="action_reports"
          idField="action_report_id"
          id={row.action_report_id}
          data={row.data ?? {}}
          autoFocus
          ref={autoFocusRef}
        />
      </div>
    </>
  )
}
