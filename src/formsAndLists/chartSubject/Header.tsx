import { useParams, useNavigate } from '@tanstack/react-router'
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { createChartSubject } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { designingAtom, addOperationAtom } from '../../store.ts'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/subjects/$chartSubjectId/'

// TODO: if not editing, hide add and remove buttons
export const Header = ({ autoFocusRef }) => {
  const [designing] = useAtom(designingAtom)
  const addOperation = useSetAtom(addOperationAtom)

  const { chartId, chartSubjectId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = async () => {
    const res = await createChartSubject({ chartId, db })
    const data = res?.rows?.[0]
    navigate({
      to: `../${data.chart_subject_id}`,
      params: (prev) => ({ ...prev, chartSubjectId: data.chart_subject_id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () => {
    db.query(`DELETE FROM chart_subjects WHERE chart_subject_id = $1`, [
      chartSubjectId,
    ])
    navigate({ to: '..' })
  }

  const toNext = async () => {
    const res = await db.query(
      `SELECT chart_subject_id FROM chart_subjects WHERE chart_id = $1 order by label`,
      [chartId],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.chart_subject_id === chartSubjectId)
    const next = rows[(index + 1) % len]
    navigate({
      to: `../${next.chart_subject_id}`,
      params: (prev) => ({ ...prev, chartSubjectId: next.chart_subject_id }),
    })
  }

  const toPrevious = async () => {
    const res = await db.query(
      `SELECT chart_subject_id FROM chart_subjects WHERE chart_id = $1 order by label`,
      [chartId],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.chart_subject_id === chartSubjectId)
    const previous = rows[(index + len - 1) % len]
    navigate({
      to: `../${previous.chart_subject_id}`,
      params: (prev) => ({
        ...prev,
        chartSubjectId: previous.chart_subject_id,
      }),
    })
  }

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
}
