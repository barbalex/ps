import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { createUnit } from '../../modules/createRows'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, unit_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const unit = createUnit()
    await db.units.create({
      data: { ...unit, project_id },
    })
    navigate({
      pathname: `../${unit.unit_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db.units, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    await db.units.delete({ where: { unit_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.units, navigate, unit_id, searchParams])

  const toNext = useCallback(async () => {
    const units = await db.units.findMany({
      where: {  project_id },
      orderBy: { label: 'asc' },
    })
    const len = units.length
    const index = units.findIndex((p) => p.unit_id === unit_id)
    const next = units[(index + 1) % len]
    navigate({
      pathname: `../${next.unit_id}`,
      search: searchParams.toString(),
    })
  }, [db.units, navigate, project_id, unit_id, searchParams])

  const toPrevious = useCallback(async () => {
    const units = await db.units.findMany({
      where: {  project_id },
      orderBy: { label: 'asc' },
    })
    const len = units.length
    const index = units.findIndex((p) => p.unit_id === unit_id)
    const previous = units[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.unit_id}`,
      search: searchParams.toString(),
    })
  }, [db.units, navigate, project_id, unit_id, searchParams])

  return (
    <FormHeader
      title="Unit"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="unit"
    />
  )
})
