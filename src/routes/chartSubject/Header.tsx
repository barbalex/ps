import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { createChartSubject } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { designingAtom } from '../../store.ts'

// TODO: if not editing, hide add and remove buttons
export const Header = memo(({ autoFocusRef }) => {
  const [designing] = useAtom(designingAtom)
  const { chart_id, chart_subject_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const data = createChartSubject({ chart_id })
    await db.chart_subjects.create({ data })
    navigate({
      pathname: `../${data.chart_subject_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, chart_id, db.chart_subjects, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    await db.chart_subjects.delete({ where: { chart_subject_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.chart_subjects, chart_subject_id, navigate, searchParams])

  const toNext = useCallback(async () => {
    const chartSubjects = await db.chart_subjects.findMany({
      where: { chart_id },
      orderBy: { label: 'asc' },
    })
    const len = chartSubjects.length
    const index = chartSubjects.findIndex(
      (p) => p.chart_subject_id === chart_subject_id,
    )
    const next = chartSubjects[(index + 1) % len]
    navigate({
      pathname: `../${next.chart_subject_id}`,
      search: searchParams.toString(),
    })
  }, [db.chart_subjects, chart_id, navigate, searchParams, chart_subject_id])

  const toPrevious = useCallback(async () => {
    const chartSubjects = await db.chart_subjects.findMany({
      where: { chart_id },
      orderBy: { label: 'asc' },
    })
    const len = chartSubjects.length
    const index = chartSubjects.findIndex(
      (p) => p.chart_subject_id === chart_subject_id,
    )
    const previous = chartSubjects[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.chart_subject_id}`,
      search: searchParams.toString(),
    })
  }, [db.chart_subjects, chart_id, navigate, searchParams, chart_subject_id])

  return (
    <FormHeader
      title="Chart Subject"
      addRow={designing ? addRow : undefined}
      deleteRow={designing ? deleteRow : undefined}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="chart subject"
    />
  )
})
