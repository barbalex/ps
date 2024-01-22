import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { ObservationSources as ObservationSource } from '../../../generated/client'
import { ObservationSourceNode } from './ObservationSource'

export const ObservationSourcesNode = ({ project_id, level = 3 }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.observation_sources.liveMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    }),
  )
  const observationSources: ObservationSource[] = results ?? []

  const observationSourcesNode = useMemo(
    () => ({
      label: `Observation Sources (${observationSources.length})`,
    }),
    [observationSources.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'observation-sources'
  const isActive = isOpen && urlPath.length === 3

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(`/projects/${project_id}`)
    navigate(`/projects/${project_id}/observation-sources`)
  }, [isOpen, navigate, project_id])

  return (
    <>
      <Node
        node={observationSourcesNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={observationSources.length}
        to={`/projects/${project_id}/observation-sources`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        observationSources.map((observationSource) => (
          <ObservationSourceNode
            key={observationSource.observation_source_id}
            project_id={project_id}
            observationSource={observationSource}
          />
        ))}
    </>
  )
}
