import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createPlaceLevel } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

interface Props {
  autoFocusRef: React.RefObject<HTMLInputElement>
}

export const Header = memo(({ autoFocusRef }: Props) => {
  const { project_id, place_level_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createPlaceLevel({ db, project_id })
    const placeLevel = res.rows[0]
    navigate({
      pathname: `../${placeLevel.place_level_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM place_levels WHERE place_level_id = $1`, [
      place_level_id,
    ])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, navigate, place_level_id, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT place_level_id FROM place_levels WHERE project_id = $1 ORDER BY label ASC`,
      [project_id],
    )
    const placeLevels = res.rows
    const len = placeLevels.length
    const index = placeLevels.findIndex(
      (p) => p.place_level_id === place_level_id,
    )
    const next = placeLevels[(index + 1) % len]
    navigate({
      pathname: `../${next.place_level_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, place_level_id, project_id, searchParams])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT place_level_id FROM place_levels WHERE project_id = $1 ORDER BY label ASC`,
      [project_id],
    )
    const placeLevels = res.rows
    const len = placeLevels.length
    const index = placeLevels.findIndex(
      (p) => p.place_level_id === place_level_id,
    )
    const previous = placeLevels[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.place_level_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, place_level_id, project_id, searchParams])

  return (
    <FormHeader
      title="Place level"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="place level"
    />
  )
})
