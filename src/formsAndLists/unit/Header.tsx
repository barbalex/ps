import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createUnit } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

const from = '/data/projects/$projectId_/units/$unitId/'

export const Header = memo(({ autoFocusRef }) => {
  const { projectId, unitId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createUnit({ db, projectId })
    const unit = res?.rows?.[0]
    navigate({
      to: `../${unit.unit_id}`,
      params: (prev) => ({ ...prev, unitId: unit.unit_id }),
    })
    autoFocusRef?.current?.focus()
  }, [autoFocusRef, db, navigate, projectId])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM units WHERE unit_id = $1`, [unitId])
    navigate({ to: '..' })
  }, [db, navigate, unitId])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT unit_id FROM units WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const units = res?.rows
    const len = units.length
    const index = units.findIndex((p) => p.unit_id === unitId)
    const next = units[(index + 1) % len]
    navigate({
      to: `../${next.unit_id}`,
      params: (prev) => ({ ...prev, unitId: next.unit_id }),
    })
  }, [db, navigate, projectId, unitId])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT unit_id FROM units WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const units = res?.rows
    const len = units.length
    const index = units.findIndex((p) => p.unit_id === unitId)
    const previous = units[(index + len - 1) % len]
    navigate({
      to: `../${previous.unit_id}`,
      params: (prev) => ({ ...prev, unitId: previous.unit_id }),
    })
  }, [db, navigate, projectId, unitId])

  return (
    <FormHeader
      title="Unit"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="unit"
    />
  )
})
