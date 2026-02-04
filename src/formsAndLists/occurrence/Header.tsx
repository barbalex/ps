import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useRef, useEffect } from 'react'

import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = ({ from }) => {
  const { occurrenceId, placeId, placeId2 } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  // Keep a ref to the current occurrenceId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const occurrenceIdRef = useRef(occurrenceId)
  useEffect(() => {
    occurrenceIdRef.current = occurrenceId
  }, [occurrenceId])

  const toNext = async () => {
    try {
      const res = await db.query(
        'SELECT occurrence_id FROM occurrences WHERE place_id = $1 ORDER BY label',
        [placeId2 ?? placeId],
      )
      const occurrences = res?.rows
      const len = occurrences.length
      const index = occurrences.findIndex((p) => p.occurrence_id === occurrenceIdRef.current)
      const next = occurrences[(index + 1) % len]
      navigate({
        to: `../${next.occurrence_id}`,
        params: (prev) => ({ ...prev, occurrenceId: next.occurrence_id }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        'SELECT occurrence_id FROM occurrences WHERE place_id = $1 ORDER BY label',
        [placeId2 ?? placeId],
      )
      const occurrences = res?.rows
      const len = occurrences.length
      const index = occurrences.findIndex((p) => p.occurrence_id === occurrenceIdRef.current)
      const previous = occurrences[(index + len - 1) % len]
      navigate({
        to: `../${previous.occurrence_id}`,
        params: (prev) => ({ ...prev, occurrenceId: previous.occurrence_id }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <FormHeader
      title="Occurrence"
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="occurrence"
    />
  )
}
