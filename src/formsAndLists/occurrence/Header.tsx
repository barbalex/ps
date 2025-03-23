import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ from }) => {
  const { occurrenceId, placeId, placeId2 } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const toNext = useCallback(async () => {
    const res = await db.query(
      'SELECT occurrence_id FROM occurrences WHERE place_id = $1 ORDER BY label',
      [placeId2 ?? placeId],
    )
    const occurrences = res?.rows
    const len = occurrences.length
    const index = occurrences.findIndex((p) => p.occurrence_id === occurrenceId)
    const next = occurrences[(index + 1) % len]
    navigate({
      to: `../${next.occurrence_id}`,
      params: (prev) => ({ ...prev, occurrenceId: next.occurrence_id }),
    })
  }, [db, navigate, occurrenceId, placeId, placeId2])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      'SELECT occurrence_id FROM occurrences WHERE place_id = $1 ORDER BY label',
      [placeId2 ?? placeId],
    )
    const occurrences = res?.rows
    const len = occurrences.length
    const index = occurrences.findIndex((p) => p.occurrence_id === occurrenceId)
    const previous = occurrences[(index + len - 1) % len]
    navigate({
      to: `../${previous.occurrence_id}`,
      params: (prev) => ({ ...prev, occurrenceId: previous.occurrence_id }),
    })
  }, [db, navigate, occurrenceId, placeId, placeId2])

  return (
    <FormHeader
      title="Occurrence"
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="occurrence"
    />
  )
})
