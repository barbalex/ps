import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { createUnit } from '../../modules/createRows'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, unit_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()

  const baseUrl = `/projects/${project_id}/units`

  const addRow = useCallback(async () => {
    const unit = createUnit()
    await db.units.create({
      data: { ...unit, project_id },
    })
    navigate(`${baseUrl}/${unit.unit_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, baseUrl, db.units, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.units.delete({
      where: { unit_id },
    })
    navigate(baseUrl)
  }, [baseUrl, db.units, navigate, unit_id])

  const toNext = useCallback(async () => {
    const units = await db.units.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = units.length
    const index = units.findIndex((p) => p.unit_id === unit_id)
    const next = units[(index + 1) % len]
    navigate(`${baseUrl}/${next.unit_id}`)
  }, [baseUrl, db.units, navigate, project_id, unit_id])

  const toPrevious = useCallback(async () => {
    const units = await db.units.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = units.length
    const index = units.findIndex((p) => p.unit_id === unit_id)
    const previous = units[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.unit_id}`)
  }, [baseUrl, db.units, navigate, project_id, unit_id])

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
