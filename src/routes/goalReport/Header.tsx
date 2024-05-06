import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { createGoalReport } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider.tsx'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, goal_id, goal_report_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const data = await createGoalReport({ db, project_id, goal_id })
    await db.goal_reports.create({ data })
    navigate({
      pathname: `../${data.goal_report_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, goal_id, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    await db.goal_reports.delete({ where: { goal_report_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.goal_reports, goal_report_id, navigate, searchParams])

  const toNext = useCallback(async () => {
    const goalReports = await db.goal_reports.findMany({
      where: {  goal_id },
      orderBy: { label: 'asc' },
    })
    const len = goalReports.length
    const index = goalReports.findIndex(
      (p) => p.goal_report_id === goal_report_id,
    )
    const next = goalReports[(index + 1) % len]
    navigate({
      pathname: `../${next.goal_report_id}`,
      search: searchParams.toString(),
    })
  }, [db.goal_reports, goal_id, goal_report_id, navigate, searchParams])

  const toPrevious = useCallback(async () => {
    const goalReports = await db.goal_reports.findMany({
      where: {  goal_id },
      orderBy: { label: 'asc' },
    })
    const len = goalReports.length
    const index = goalReports.findIndex(
      (p) => p.goal_report_id === goal_report_id,
    )
    const previous = goalReports[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.goal_report_id}`,
      search: searchParams.toString(),
    })
  }, [db.goal_reports, goal_id, goal_report_id, navigate, searchParams])

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
