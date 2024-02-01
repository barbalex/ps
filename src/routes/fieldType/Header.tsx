import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createFieldType } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { field_type_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()

  const addRow = useCallback(async () => {
    const data = createFieldType()
    await db.field_types.create({ data })
    navigate(`/field-types/${data.field_type_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db.field_types, navigate])

  const deleteRow = useCallback(async () => {
    await db.field_types.delete({
      where: { field_type_id },
    })
    navigate(`/field-types`)
  }, [db.field_types, field_type_id, navigate])

  const toNext = useCallback(async () => {
    const fieldTypes = await db.field_types.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = fieldTypes.length
    const index = fieldTypes.findIndex((p) => p.field_type_id === field_type_id)
    const next = fieldTypes[(index + 1) % len]
    navigate(`/field-types/${next.field_type_id}`)
  }, [db.field_types, field_type_id, navigate])

  const toPrevious = useCallback(async () => {
    const fieldTypes = await db.field_types.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = fieldTypes.length
    const index = fieldTypes.findIndex((p) => p.field_type_id === field_type_id)
    const previous = fieldTypes[(index + len - 1) % len]
    navigate(`/field-types/${previous.field_type_id}`)
  }, [db.field_types, field_type_id, navigate])

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
