import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createCrs } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

const from = '/data/crs/$crsId'

export const Header = ({ autoFocusRef }) => {
  const { crsId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const id = await createCrs()
    if (!id) return
    navigate({
      to: `/data/crs/${id}`,
      params: (prev) => ({ ...prev, crsId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    const prevRes = await db.query(`SELECT * FROM crs WHERE crs_id = $1`, [
      crsId,
    ])
    const prev = prevRes?.rows?.[0] ?? {}
    db.query(`DELETE FROM crs WHERE crs_id = $1`, [crsId])
    addOperation({
      table: 'crs',
      rowIdName: 'crs_id',
      rowId: crsId,
      operation: 'delete',
      prev,
    })
    navigate({ to: '/data/crs' })
  }

  const toNext = async () => {
    const res = await db.query(`SELECT crs_id FROM crs order by label`)
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.crs_id === crsId)
    const next = rows[(index + 1) % len]
    navigate({
      to: `/data/crs/${next.crs_id}`,
      params: (prev) => ({ ...prev, crsId: next.crs_id }),
    })
  }

  const toPrevious = async () => {
    const res = await db.query(`SELECT crs_id FROM crs order by label`)
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.crs_id === crsId)
    const previous = rows[(index + len - 1) % len]
    navigate({
      to: `/data/crs/${previous.crs_id}`,
      params: (prev) => ({ ...prev, crsId: previous.crs_id }),
    })
  }

  return (
    <FormHeader
      title="CRS"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="crs"
    />
  )
}
