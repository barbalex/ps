import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createUnit } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, unit_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createUnit({ db, project_id })
    const unit = res?.rows?.[0]
    navigate({
      pathname: `../${unit.unit_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM units WHERE unit_id = $1`, [unit_id])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, navigate, unit_id, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT unit_id FROM units WHERE project_id = $1 ORDER BY label ASC`,
      [project_id],
    )
    const units = res?.rows
    const len = units.length
    const index = units.findIndex((p) => p.unit_id === unit_id)
    const next = units[(index + 1) % len]
    navigate({
      pathname: `../${next.unit_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_id, unit_id, searchParams])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT unit_id FROM units WHERE project_id = $1 ORDER BY label ASC`,
      [project_id],
    )
    const units = res?.rows
    const len = units.length
    const index = units.findIndex((p) => p.unit_id === unit_id)
    const previous = units[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.unit_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_id, unit_id, searchParams])

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
