import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(() => {
  const { project_id, occurrence_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const toNext = useCallback(async () => {
    const res = await db.query(
      'SELECT occurrence_id FROM occurrences WHERE project_id = $1 ORDER BY label ASC',
      [project_id],
    )
    const occurrences = res?.rows
    const len = occurrences.length
    const index = occurrences.findIndex(
      (p) => p.occurrence_id === occurrence_id,
    )
    const next = occurrences[(index + 1) % len]
    navigate({
      pathname: `../${next.occurrence_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, occurrence_id, project_id, searchParams])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      'SELECT occurrence_id FROM occurrences WHERE project_id = $1 ORDER BY label ASC',
      [project_id],
    )
    const occurrences = res?.rows
    const len = occurrences.length
    const index = occurrences.findIndex(
      (p) => p.occurrence_id === occurrence_id,
    )
    const previous = occurrences[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.occurrence_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, occurrence_id, project_id, searchParams])

  return (
    <FormHeader
      title="Occurrence"
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="occurrence"
    />
  )
})
