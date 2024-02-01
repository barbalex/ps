import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createObservation } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, observation_id, observation_source_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()

  const baseUrl = `/projects/${project_id}/observation-sources/${observation_source_id}/observations`

  const addRow = useCallback(async () => {
    const data = await createObservation({
      db,
      project_id,
      observation_source_id,
    })
    await db.observations.create({ data })
    navigate(`${baseUrl}/${data.observation_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, baseUrl, db, navigate, observation_source_id, project_id])

  const deleteRow = useCallback(async () => {
    await db.observations.delete({
      where: {
        observation_id,
      },
    })
    navigate(baseUrl)
  }, [baseUrl, db.observations, navigate, observation_id])

  const toNext = useCallback(async () => {
    const observations = await db.observations.findMany({
      where: { deleted: false, observation_source_id },
      orderBy: { label: 'asc' },
    })
    const len = observations.length
    const index = observations.findIndex(
      (p) => p.observation_id === observation_id,
    )
    const next = observations[(index + 1) % len]
    navigate(`${baseUrl}/${next.observation_id}`)
  }, [
    baseUrl,
    db.observations,
    navigate,
    observation_id,
    observation_source_id,
  ])

  const toPrevious = useCallback(async () => {
    const observations = await db.observations.findMany({
      where: { deleted: false, observation_source_id },
      orderBy: { label: 'asc' },
    })
    const len = observations.length
    const index = observations.findIndex(
      (p) => p.observation_id === observation_id,
    )
    const previous = observations[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.observation_id}`)
  }, [
    baseUrl,
    db.observations,
    navigate,
    observation_id,
    observation_source_id,
  ])

  return (
    <FormHeader
      title="Observation"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="observation"
    />
  )
})
