import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { createCheckValue } from '../../modules/createRows.ts'
import { useElectric } from '../../ElectricProvider.tsx'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { check_id, check_value_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const checkValue = createCheckValue()
    await db.check_values.create({
      data: {
        ...checkValue,
        check_id,
      },
    })
    navigate({
      pathname: `../${checkValue.check_value_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, check_id, db.check_values, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    await db.check_values.delete({
      where: { check_value_id },
    })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [check_value_id, db.check_values, navigate, searchParams])

  const toNext = useCallback(async () => {
    const checkValues = await db.check_values.findMany({
      where: {  check_id },
      orderBy: { label: 'asc' },
    })
    const len = checkValues.length
    const index = checkValues.findIndex(
      (p) => p.check_value_id === check_value_id,
    )
    const next = checkValues[(index + 1) % len]
    navigate({
      pathname: `../${next.check_value_id}`,
      search: searchParams.toString(),
    })
  }, [check_id, check_value_id, db.check_values, navigate, searchParams])

  const toPrevious = useCallback(async () => {
    const checkValues = await db.check_values.findMany({
      where: {  check_id },
      orderBy: { label: 'asc' },
    })
    const len = checkValues.length
    const index = checkValues.findIndex(
      (p) => p.check_value_id === check_value_id,
    )
    const previous = checkValues[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.check_value_id}`,
      search: searchParams.toString(),
    })
  }, [check_id, check_value_id, db.check_values, navigate, searchParams])

  return (
    <FormHeader
      title="Check value"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="check value"
    />
  )
})
