import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createGoalReportValue } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { goal_report_id, goal_report_value_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const goalReportValue = createGoalReportValue()
    await db.goal_report_values.create({
      data: {
        ...goalReportValue,
        goal_report_id,
      },
    })
    navigate({
      pathname: `../${goalReportValue.goal_report_value_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [
    autoFocusRef,
    db.goal_report_values,
    goal_report_id,
    navigate,
    searchParams,
  ])

  const deleteRow = useCallback(async () => {
    await db.goal_report_values.delete({
      where: { goal_report_value_id },
    })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.goal_report_values, goal_report_value_id, navigate, searchParams])

  const toNext = useCallback(async () => {
    const goalReportValues = await db.goal_report_values.findMany({
      where: { goal_report_id },
      orderBy: { label: 'asc' },
    })
    const len = goalReportValues.length
    const index = goalReportValues.findIndex(
      (p) => p.goal_report_value_id === goal_report_value_id,
    )
    const next = goalReportValues[(index + 1) % len]
    navigate({
      pathname: `../${next.goal_report_value_id}`,
      search: searchParams.toString(),
    })
  }, [
    db.goal_report_values,
    goal_report_id,
    goal_report_value_id,
    navigate,
    searchParams,
  ])

  const toPrevious = useCallback(async () => {
    const goalReportValues = await db.goal_report_values.findMany({
      where: { goal_report_id },
      orderBy: { label: 'asc' },
    })
    const len = goalReportValues.length
    const index = goalReportValues.findIndex(
      (p) => p.goal_report_value_id === goal_report_value_id,
    )
    const previous = goalReportValues[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.goal_report_value_id}`,
      search: searchParams.toString(),
    })
  }, [
    db.goal_report_values,
    goal_report_id,
    goal_report_value_id,
    navigate,
    searchParams,
  ])

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
