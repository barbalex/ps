import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createFieldType } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { field_type_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createFieldType({ db })
    const fieldType = res?.rows?.[0]
    navigate({
      pathname: `../${fieldType.field_type_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    await db.quey(`DELETE FROM field_types WHERE field_type_id = $1`, [
      field_type_id,
    ])
    navigate({ pathname: `..`, search: searchParams.toString() })
  }, [db, field_type_id, navigate, searchParams])

  const toNext = useCallback(async () => {
    const result = await db.query(
      `SELECT * FROM field_types order by label asc`,
    )
    const fieldTypes = result?.rows
    const len = fieldTypes.length
    const index = fieldTypes.findIndex((p) => p.field_type_id === field_type_id)
    const next = fieldTypes[(index + 1) % len]
    navigate({
      pathname: `../${next.field_type_id}`,
      search: searchParams.toString(),
    })
  }, [db, field_type_id, navigate, searchParams])

  const toPrevious = useCallback(async () => {
    const result = await db.query(
      `SELECT * FROM field_types order by label asc`,
    )
    const fieldTypes = result?.rows
    const len = fieldTypes.length
    const index = fieldTypes.findIndex((p) => p.field_type_id === field_type_id)
    const previous = fieldTypes[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.field_type_id}`,
      search: searchParams.toString(),
    })
  }, [db, field_type_id, navigate, searchParams])

  return (
    <FormHeader
      title="Field type"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="field type"
    />
  )
})
