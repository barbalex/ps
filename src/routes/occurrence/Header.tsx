import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(() => {
  const { project_id, occurrence_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const toNext = useCallback(async () => {
    const occurrences = await db.occurrences.findMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    })
    const len = occurrences.length
    const index = occurrences.findIndex(
      (p) => p.occurrence_id === occurrence_id,
    )
    const next = occurrences[(index + 1) % len]
    navigate({
      pathname: `../${next.occurrence_id}`,
      search: searchParams.toString(),
    })
  }, [db.occurrences, navigate, occurrence_id, project_id, searchParams])

  const toPrevious = useCallback(async () => {
    const occurrences = await db.occurrences.findMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    })
    const len = occurrences.length
    const index = occurrences.findIndex(
      (p) => p.occurrence_id === occurrence_id,
    )
    const previous = occurrences[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.occurrence_id}`,
      search: searchParams.toString(),
    })
  }, [db.occurrences, navigate, occurrence_id, project_id, searchParams])

  return (
    <FormHeader
      title="Occurrence"
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="occurrence"
    />
  )
})
