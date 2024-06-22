import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { createCrs } from '../../modules/createRows.ts'
import { useElectric } from '../../ElectricProvider.tsx'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, crs_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const data = await createCrs({ project_id })
    await db.crs.create({ data })
    navigate({
      pathname: `../${data.crs_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db.crs, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    await db.crs.delete({ where: { crs_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.crs, navigate, crs_id, searchParams])

  const toNext = useCallback(async () => {
    const crs = await db.crs.findMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    })
    const len = crs.length
    const index = crs.findIndex((p) => p.crs_id === crs_id)
    const next = crs[(index + 1) % len]
    navigate({
      pathname: `../${next.crs_id}`,
      search: searchParams.toString(),
    })
  }, [db.crs, navigate, crs_id, project_id, searchParams])

  const toPrevious = useCallback(async () => {
    const crs = await db.crs.findMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    })
    const len = crs.length
    const index = crs.findIndex((p) => p.crs_id === crs_id)
    const previous = crs[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.crs_id}`,
      search: searchParams.toString(),
    })
  }, [db.crs, navigate, crs_id, project_id, searchParams])

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
