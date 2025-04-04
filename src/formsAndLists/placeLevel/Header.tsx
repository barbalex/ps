import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createPlaceLevel } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

interface Props {
  autoFocusRef: React.RefObject<HTMLInputElement>
}

const from =
  '/data/_authLayout/projects/$projectId_/place-levels/$placeLevelId/'

export const Header = memo(({ autoFocusRef }: Props) => {
  const { projectId, placeLevelId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createPlaceLevel({ db, project_id: projectId })
    const placeLevel = res?.rows?.[0]
    navigate({
      to: `../${placeLevel.place_level_id}`,
      params: (prev) => ({ ...prev, placeLevelId: placeLevel.place_level_id }),
    })
    autoFocusRef?.current?.focus()
  }, [autoFocusRef, db, navigate, projectId])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM place_levels WHERE place_level_id = $1`, [
      placeLevelId,
    ])
    navigate({ to: '..' })
  }, [db, navigate, placeLevelId])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT place_level_id FROM place_levels WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const placeLevels = res?.rows
    const len = placeLevels.length
    const index = placeLevels.findIndex(
      (p) => p.place_level_id === placeLevelId,
    )
    const next = placeLevels[(index + 1) % len]
    navigate({
      to: `../${next.place_level_id}`,
      params: (prev) => ({ ...prev, placeLevelId: next.place_level_id }),
    })
  }, [db, navigate, placeLevelId, projectId])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT place_level_id FROM place_levels WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const placeLevels = res?.rows
    const len = placeLevels.length
    const index = placeLevels.findIndex(
      (p) => p.place_level_id === placeLevelId,
    )
    const previous = placeLevels[(index + len - 1) % len]
    navigate({
      to: `../${previous.place_level_id}`,
      params: (prev) => ({ ...prev, placeLevelId: previous.place_level_id }),
    })
  }, [db, navigate, placeLevelId, projectId])

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
