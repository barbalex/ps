import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { Observations as Observation } from '../../../generated/client'
import { ObservationNode } from './Observation'

export const ObservationsNode = ({
  project_id,
  observation_source_id,
  level = 5,
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.observations.liveMany({
      where: { deleted: false, observation_source_id },
      orderBy: { label: 'asc' },
    }),
  )
  const observations: Observation[] = results ?? []

  const observationsNode = useMemo(
    () => ({
      label: `Observations (${observations.length})`,
    }),
    [observations.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'observation-sources' &&
    urlPath[3] === observation_source_id &&
    urlPath[4] === 'observations'
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(
        `/projects/${project_id}/observation-sources/${observation_source_id}`,
      )
    navigate(
      `/projects/${project_id}/observation-sources/${observation_source_id}/observations`,
    )
  }, [isOpen, navigate, observation_source_id, project_id])

  return (
    <>
      <Node
        node={observationsNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={observations.length}
        to={`/projects/${project_id}/observation-sources/${observation_source_id}/observations`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        observations.map((observation) => (
          <ObservationNode
            key={observation.observation_id}
            project_id={project_id}
            observation_source_id={observation_source_id}
            observation={observation}
          />
        ))}
    </>
  )
}
