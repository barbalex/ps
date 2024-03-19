import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { createObservationSource } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, observation_source_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const data = await createObservationSource({
      db,
      project_id,
    })
    await db.observation_sources.create({ data })
    navigate({
      pathname: `../${data.observation_source_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    await db.observation_sources.delete({
      where: { observation_source_id },
    })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.observation_sources, navigate, observation_source_id, searchParams])

  const toNext = useCallback(async () => {
    const observationSources = await db.observation_sources.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = observationSources.length
    const index = observationSources.findIndex(
      (p) => p.observation_source_id === observation_source_id,
    )
    const next = observationSources[(index + 1) % len]
    navigate({
      pathname: `../${next.observation_source_id}`,
      search: searchParams.toString(),
    })
  }, [
    db.observation_sources,
    navigate,
    observation_source_id,
    project_id,
    searchParams,
  ])

  const toPrevious = useCallback(async () => {
    const observationSources = await db.observation_sources.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = observationSources.length
    const index = observationSources.findIndex(
      (p) => p.observation_source_id === observation_source_id,
    )
    const previous = observationSources[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.observation_source_id}`,
      search: searchParams.toString(),
    })
  }, [
    db.observation_sources,
    navigate,
    observation_source_id,
    project_id,
    searchParams,
  ])

  return (
    <FormHeader
      title="Observation Source"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="observation source"
    />
  )
})
