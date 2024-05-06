import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { createFieldType } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider.tsx'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { field_type_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const data = createFieldType()
    await db.field_types.create({ data })
    navigate({
      pathname: `../${data.field_type_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db.field_types, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    await db.field_types.delete({
      where: { field_type_id },
    })
    navigate({ pathname: `..`, search: searchParams.toString() })
  }, [db.field_types, field_type_id, navigate, searchParams])

  const toNext = useCallback(async () => {
    const fieldTypes = await db.field_types.findMany({
      orderBy: { label: 'asc' },
    })
    const len = fieldTypes.length
    const index = fieldTypes.findIndex((p) => p.field_type_id === field_type_id)
    const next = fieldTypes[(index + 1) % len]
    navigate({
      pathname: `../${next.field_type_id}`,
      search: searchParams.toString(),
    })
  }, [db.field_types, field_type_id, navigate, searchParams])

  const toPrevious = useCallback(async () => {
    const fieldTypes = await db.field_types.findMany({
      orderBy: { label: 'asc' },
    })
    const len = fieldTypes.length
    const index = fieldTypes.findIndex((p) => p.field_type_id === field_type_id)
    const previous = fieldTypes[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.field_type_id}`,
      search: searchParams.toString(),
    })
  }, [db.field_types, field_type_id, navigate, searchParams])

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
