import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createCrs } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { crs_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createCrs({ db })
    const data = res?.rows?.[0]
    navigate({
      pathname: `../${data.crs_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    await db.query(`DELETE FROM crs WHERE crs_id = $1`, [crs_id])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, crs_id, navigate, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(`SELECT crs_id FROM crs order by label`)
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.crs_id === crs_id)
    const next = rows[(index + 1) % len]
    navigate({
      pathname: `../${next.crs_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, searchParams, crs_id])

  const toPrevious = useCallback(async () => {
    const res = await db.query(`SELECT crs_id FROM crs order by label`)
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.crs_id === crs_id)
    const previous = rows[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.crs_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, searchParams, crs_id])

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
