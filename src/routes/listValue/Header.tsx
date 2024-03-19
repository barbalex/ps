import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { createListValue } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { list_id, list_value_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const listValue = createListValue()
    await db.list_values.create({
      data: { ...listValue, list_id },
    })
    navigate({
      pathname: `../${listValue.list_value_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db.list_values, list_id, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    await db.list_values.delete({ where: { list_value_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.list_values, list_value_id, navigate, searchParams])

  const toNext = useCallback(async () => {
    const listValues = await db.list_values.findMany({
      where: { deleted: false, list_id },
      orderBy: { label: 'asc' },
    })
    const len = listValues.length
    const index = listValues.findIndex((p) => p.list_value_id === list_value_id)
    const next = listValues[(index + 1) % len]
    navigate({
      pathname: `../${next.list_value_id}`,
      search: searchParams.toString(),
    })
  }, [db.list_values, list_id, list_value_id, navigate, searchParams])

  const toPrevious = useCallback(async () => {
    const listValues = await db.list_values.findMany({
      where: { deleted: false, list_id },
      orderBy: { label: 'asc' },
    })
    const len = listValues.length
    const index = listValues.findIndex((p) => p.list_value_id === list_value_id)
    const previous = listValues[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.list_value_id}`,
      search: searchParams.toString(),
    })
  }, [db.list_values, list_id, list_value_id, navigate, searchParams])

  return (
    <FormHeader
      title="List Value"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="list value"
    />
  )
})
