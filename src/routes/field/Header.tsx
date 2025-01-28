import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createField } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, field_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const data = createField({ project_id })
    await db.fields.create({ data })
    navigate({
      pathname: `../${data.field_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db.fields, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    await db.fields.delete({ where: { field_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.fields, field_id, navigate, searchParams])

  const toNext = useCallback(async () => {
    const fields = await db.fields.findMany({
      where: {
        project_id: project_id ?? null,
      },
      orderBy: { label: 'asc' },
    })
    const len = fields.length
    const index = fields.findIndex((p) => p.field_id === field_id)
    const next = fields[(index + 1) % len]
    navigate({
      pathname: `../${next.field_id}`,
      search: searchParams.toString(),
    })
  }, [db.fields, project_id, navigate, searchParams, field_id])

  const toPrevious = useCallback(async () => {
    const fields = await db.fields.findMany({
      where: {
        project_id: project_id ?? null,
      },
      orderBy: { label: 'asc' },
    })
    const len = fields.length
    const index = fields.findIndex((p) => p.field_id === field_id)
    const previous = fields[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.field_id}`,
      search: searchParams.toString(),
    })
  }, [db.fields, project_id, navigate, searchParams, field_id])

  return (
    <FormHeader
      title="Field"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="field"
    />
  )
})
