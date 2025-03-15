import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
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
    const res = await createChartSubject({ chart_id, db })
    const data = res?.rows?.[0]
    navigate({
      pathname: `../${data.chart_subject_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, chart_id, db, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    await db.query(`DELETE FROM chart_subjects WHERE chart_subject_id = $1`, [
      chart_subject_id,
    ])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, chart_subject_id, navigate, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT chart_subject_id FROM chart_subjects WHERE chart_id = $1 order by label`,
      [chart_id],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.chart_subject_id === chart_subject_id)
    const next = rows[(index + 1) % len]
    navigate({
      pathname: `../${next.chart_subject_id}`,
      search: searchParams.toString(),
    })
  }, [db, chart_id, navigate, searchParams, chart_subject_id])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT chart_subject_id FROM chart_subjects WHERE chart_id = $1 order by label`,
      [chart_id],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.chart_subject_id === chart_subject_id)
    const previous = rows[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.chart_subject_id}`,
      search: searchParams.toString(),
    })
  }, [db, chart_id, navigate, searchParams, chart_subject_id])

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
