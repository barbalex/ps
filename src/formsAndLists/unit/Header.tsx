import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'

import { createUnit } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

const from = '/data/projects/$projectId_/units/$unitId/'

export const Header = ({ autoFocusRef }) => {
  const { projectId, unitId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  // Keep a ref to the current unitId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const unitIdRef = useRef(unitId)
  useEffect(() => {
    unitIdRef.current = unitId
  }, [unitId])

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM units WHERE project_id = '${projectId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const id = await createUnit({ projectId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({ ...prev, unitId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
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
    } catch (error) {
      console.error('Error deleting unit:', error)
      // Could add a toast notification here
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT unit_id FROM units WHERE project_id = $1 ORDER BY label`,
        [projectId],
      )
      const units = res?.rows
      const len = units.length
      const index = units.findIndex((p) => p.unit_id === unitIdRef.current)
      const next = units[(index + 1) % len]
      navigate({
        to: `../${next.unit_id}`,
        params: (prev) => ({ ...prev, unitId: next.unit_id }),
      })
    } catch (error) {
      console.error('Error navigating to next unit:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT unit_id FROM units WHERE project_id = $1 ORDER BY label`,
        [projectId],
      )
      const units = res?.rows
      const len = units.length
      const index = units.findIndex((p) => p.unit_id === unitIdRef.current)
      const previous = units[(index + len - 1) % len]
      navigate({
        to: `../${previous.unit_id}`,
        params: (prev) => ({ ...prev, unitId: previous.unit_id }),
      })
    } catch (error) {
      console.error('Error navigating to previous unit:', error)
    }
  }

  return (
    <FormHeader
      title="Unit"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="unit"
    />
  )
}
