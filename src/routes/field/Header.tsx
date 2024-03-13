import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { createField } from '../../modules/createRows'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, field_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const data = createField({ project_id })
    await db.fields.create({ data })
    navigate(`../${data.field_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db.fields, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.fields.delete({ where: { field_id } })
    navigate('..')
  }, [db.fields, field_id, navigate])

  const toNext = useCallback(async () => {
    const fields = await db.fields.findMany({
      where: {
        deleted: false,
        project_id: project_id ?? null,
      },
      orderBy: { label: 'asc' },
    })
    const len = fields.length
    const index = fields.findIndex((p) => p.field_id === field_id)
    const next = fields[(index + 1) % len]
    navigate(`../${next.field_id}`)
  }, [db.fields, project_id, navigate, field_id])

  const toPrevious = useCallback(async () => {
    const fields = await db.fields.findMany({
      where: {
        deleted: false,
        project_id: project_id ?? null,
      },
      orderBy: { label: 'asc' },
    })
    const len = fields.length
    const index = fields.findIndex((p) => p.field_id === field_id)
    const previous = fields[(index + len - 1) % len]
    navigate(`../${previous.field_id}`)
  }, [db.fields, project_id, navigate, field_id])

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
