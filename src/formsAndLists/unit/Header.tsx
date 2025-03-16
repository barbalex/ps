import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createUnit } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { projectId, unitId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createUnit({ db, projectId })
    const unit = res?.rows?.[0]
    navigate({
      pathname: `../${unit.unit_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, projectId, searchParams])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM units WHERE unit_id = $1`, [unitId])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, navigate, unitId, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT unit_id FROM units WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const units = res?.rows
    const len = units.length
    const index = units.findIndex((p) => p.unit_id === unitId)
    const next = units[(index + 1) % len]
    navigate({
      pathname: `../${next.unit_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, projectId, unitId, searchParams])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT unit_id FROM units WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const units = res?.rows
    const len = units.length
    const index = units.findIndex((p) => p.unit_id === unitId)
    const previous = units[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.unit_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, projectId, unitId, searchParams])

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
