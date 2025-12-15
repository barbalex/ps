import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createUnit } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

const from = '/data/projects/$projectId_/units/$unitId/'

export const Header = ({ autoFocusRef }) => {
  const { projectId, unitId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const id = await createUnit({ db, projectId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({ ...prev, unitId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    const prevRes = await db.query(`SELECT * FROM units WHERE unit_id = $1`, [
      unitId,
    ])
    const prev = prevRes?.rows?.[0] ?? {}
    await db.query(`DELETE FROM units WHERE unit_id = $1`, [unitId])
    addOperation({
      table: 'units',
      rowIdName: 'unit_id',
      rowId: unitId,
      operation: 'delete',
      prev,
    })
    navigate({ to: '..' })
  }

  const toNext = async () => {
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
  }

  const toPrevious = async () => {
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
  }

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
}
