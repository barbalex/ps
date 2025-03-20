import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ from }) => {
  const { projectId, occurrenceId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const toNext = useCallback(async () => {
    const res = await db.query(
      'SELECT occurrence_id FROM occurrences WHERE project_id = $1 ORDER BY label',
      [projectId],
    )
    const occurrences = res?.rows
    const len = occurrences.length
    const index = occurrences.findIndex((p) => p.occurrence_id === occurrenceId)
    const next = occurrences[(index + 1) % len]
    navigate({
      to: `../${next.occurrence_id}`,
      params: (prev) => ({ ...prev, occurrenceId: next.occurrence_id }),
    })
  }, [db, navigate, occurrenceId, projectId])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      'SELECT occurrence_id FROM occurrences WHERE project_id = $1 ORDER BY label',
      [projectId],
    )
    const occurrences = res?.rows
    const len = occurrences.length
    const index = occurrences.findIndex((p) => p.occurrence_id === occurrenceId)
    const previous = occurrences[(index + len - 1) % len]
    navigate({
      to: `../${previous.occurrence_id}`,
      params: (prev) => ({ ...prev, occurrenceId: previous.occurrence_id }),
    })
  }, [db, navigate, occurrenceId, projectId])

  return (
    <FormHeader
      title="Occurrence"
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="occurrence"
    />
  )
})
