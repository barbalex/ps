import { useParams, useNavigate } from '@tanstack/react-router'
import { useLiveQuery, usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'

import { createPlaceLevel } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

interface Props {
  autoFocusRef: React.RefObject<HTMLInputElement>
}

const from = '/data/projects/$projectId_/place-levels/$placeLevelId/'

export const Header = ({ autoFocusRef }: Props) => {
  const { projectId, placeLevelId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()
  const placeLevelsRes = useLiveQuery(
    `SELECT place_level_id FROM place_levels WHERE project_id = $1`,
    [projectId],
  )
  const rowCount = placeLevelsRes?.rows?.length ?? 0

  // Keep a ref to the current placeLevelId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const placeLevelIdRef = useRef(placeLevelId)
  useEffect(() => {
    placeLevelIdRef.current = placeLevelId
  }, [placeLevelId])

  const addRow = async () => {
    const id = await createPlaceLevel({ project_id: projectId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({ ...prev, placeLevelId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM place_levels WHERE place_level_id = $1`,
        [placeLevelId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(`DELETE FROM place_levels WHERE place_level_id = $1`, [
        placeLevelId,
      ])
      addOperation({
        table: 'place_levels',
        rowIdName: 'place_level_id',
        rowId: placeLevelId,
        operation: 'delete',
        prev,
      })
      navigate({ to: '..' })
    } catch (error) {
      console.error(error)
    }
  }

  const toNext = async () => {
    try {
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
    } catch (error) {
      console.error(error)
    }
  }

  const toPrevious = async () => {
    try {
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
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <FormHeader
      title="Place level"
      addRow={addRow}
      addRowDisabled={rowCount >= 2}
      addRowDisabledReason="Maximum reached: only 2 place levels are allowed"
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="place level"
    />
  )
}
