import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createCrs } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

const from = '/data/crs/$crsId'

export const Header = memo(({ autoFocusRef }) => {
  const { crsId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createCrs({ db })
    const data = res?.rows?.[0]
    navigate({
      to: `/data/crs/${data.crs_id}`,
      params: (prev) => ({ ...prev, crsId: data.crs_id }),
    })
    autoFocusRef?.current?.focus()
  }, [autoFocusRef, db, navigate])

  const deleteRow = useCallback(async () => {
    await db.query(`DELETE FROM crs WHERE crs_id = $1`, [crsId])
    navigate({ to: '/data/crs' })
  }, [db, crsId, navigate])

  const toNext = useCallback(async () => {
    const res = await db.query(`SELECT crs_id FROM crs order by label`)
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.crs_id === crsId)
    const next = rows[(index + 1) % len]
    navigate({
      to: `/data/crs/${next.crs_id}`,
      params: (prev) => ({ ...prev, crsId: next.crs_id }),
    })
  }, [db, navigate, crsId])

  const toPrevious = useCallback(async () => {
    const res = await db.query(`SELECT crs_id FROM crs order by label`)
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.crs_id === crsId)
    const previous = rows[(index + len - 1) % len]
    navigate({
      to: `/data/crs/${previous.crs_id}`,
      params: (prev) => ({ ...prev, crsId: previous.crs_id }),
    })
  }, [db, navigate, crsId])

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
})
