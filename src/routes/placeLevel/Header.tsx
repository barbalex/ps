import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createPlaceLevel } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, place_level_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const baseUrl = `/projects/${project_id}/place-levels`

  const addRow = useCallback(async () => {
    const placeLevel = createPlaceLevel()
    await db.place_levels.create({
      data: { ...placeLevel, project_id },
    })
    navigate(`${baseUrl}/${placeLevel.place_level_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, baseUrl, db.place_levels, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.place_levels.delete({
      where: { place_level_id },
    })
    navigate('..')
  }, [baseUrl, db.place_levels, navigate, place_level_id])

  const toNext = useCallback(async () => {
    const placeLevels = await db.place_levels.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = placeLevels.length
    const index = placeLevels.findIndex(
      (p) => p.place_level_id === place_level_id,
    )
    const next = placeLevels[(index + 1) % len]
    navigate(`${baseUrl}/${next.place_level_id}`)
  }, [baseUrl, db.place_levels, navigate, place_level_id, project_id])

  const toPrevious = useCallback(async () => {
    const placeLevels = await db.place_levels.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = placeLevels.length
    const index = placeLevels.findIndex(
      (p) => p.place_level_id === place_level_id,
    )
    const previous = placeLevels[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.place_level_id}`)
  }, [baseUrl, db.place_levels, navigate, place_level_id, project_id])

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
