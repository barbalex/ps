import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { createActionReport } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, action_id, action_report_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const data = await createActionReport({
      db,
      project_id,
      action_id,
    })
    await db.action_reports.create({ data })
    navigate({
      pathname: `../${data.action_report_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [action_id, autoFocusRef, db, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    await db.action_reports.delete({
      where: {
        action_report_id,
      },
    })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [action_report_id, db.action_reports, navigate, searchParams])

  const toNext = useCallback(async () => {
    const actionReports = await db.action_reports.findMany({
      where: {  action_id },
      orderBy: { label: 'asc' },
    })
    const len = actionReports.length
    const index = actionReports.findIndex(
      (p) => p.action_report_id === action_report_id,
    )
    const next = actionReports[(index + 1) % len]
    navigate({
      pathname: `../${next.action_report_id}`,
      search: searchParams.toString(),
    })
  }, [action_id, action_report_id, db.action_reports, navigate, searchParams])

  const toPrevious = useCallback(async () => {
    const actionReports = await db.action_reports.findMany({
      where: {  action_id },
      orderBy: { label: 'asc' },
    })
    const len = actionReports.length
    const index = actionReports.findIndex(
      (p) => p.action_report_id === action_report_id,
    )
    const previous = actionReports[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.action_report_id}`,
      search: searchParams.toString(),
    })
  }, [action_id, action_report_id, db.action_reports, navigate, searchParams])

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
