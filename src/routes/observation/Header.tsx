import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { createObservation } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, observation_id, observation_source_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const data = await createObservation({
      db,
      project_id,
      observation_source_id,
    })
    await db.observations.create({ data })
    navigate({
      pathname: `../${data.observation_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [
    autoFocusRef,
    db,
    navigate,
    observation_source_id,
    project_id,
    searchParams,
  ])

  const deleteRow = useCallback(async () => {
    await db.observations.delete({ where: { observation_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.observations, navigate, observation_id, searchParams])

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
    navigate({
      pathname: `../${next.observation_id}`,
      search: searchParams.toString(),
    })
  }, [
    db.observations,
    navigate,
    observation_id,
    observation_source_id,
    searchParams,
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
    navigate({
      pathname: `../${previous.observation_id}`,
      search: searchParams.toString(),
    })
  }, [
    db.observations,
    navigate,
    observation_id,
    observation_source_id,
    searchParams,
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
