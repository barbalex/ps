import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createCrs } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { crs_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const data = createCrs()
    await db.crs.create({ data })
    navigate({
      pathname: `../${data.crs_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db.crs, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    await db.crs.delete({ where: { crs_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.crs, navigate, crs_id, searchParams])

  const toNext = useCallback(async () => {
    const crs = await db.crs.findMany({
      orderBy: { label: 'asc' },
    })
    const len = crs.length
    const index = crs.findIndex((p) => p.crs_id === crs_id)
    const next = crs[(index + 1) % len]
    navigate({
      pathname: `../${next.crs_id}`,
      search: searchParams.toString(),
    })
  }, [db.crs, navigate, crs_id, searchParams])

  const toPrevious = useCallback(async () => {
    const crs = await db.crs.findMany({
      orderBy: { label: 'asc' },
    })
    const len = crs.length
    const index = crs.findIndex((p) => p.crs_id === crs_id)
    const previous = crs[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.crs_id}`,
      search: searchParams.toString(),
    })
  }, [db.crs, navigate, crs_id, searchParams])

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
