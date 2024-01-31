import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createObservationSource } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const FormHeaderComponent = memo(({ autoFocusRef }) => {
  const { project_id, observation_source_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()

  const baseUrl = `/projects/${project_id}/observation-sources`

  const addRow = useCallback(async () => {
    const data = await createObservationSource({
      db,
      project_id,
    })
    await db.observation_sources.create({ data })
    navigate(`${baseUrl}/${data.observation_source_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, baseUrl, db, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.observation_sources.delete({
      where: { observation_source_id },
    })
    navigate(baseUrl)
  }, [baseUrl, db.observation_sources, navigate, observation_source_id])

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
    navigate(`${baseUrl}/${next.observation_source_id}`)
  }, [
    baseUrl,
    db.observation_sources,
    navigate,
    observation_source_id,
    project_id,
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
    navigate(`${baseUrl}/${previous.observation_source_id}`)
  }, [
    baseUrl,
    db.observation_sources,
    navigate,
    observation_source_id,
    project_id,
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
