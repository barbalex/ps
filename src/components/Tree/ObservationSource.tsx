import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { ObservationSources as ObservationSource } from '../../../generated/client'
import { ObservationsNode } from './Observations'

export const ObservationSourceNode = ({
  project_id,
  observationSource,
  level = 4,
}: {
  project_id: string
  observationSource: ObservationSource
  level: number
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'observation-sources' &&
    urlPath[3] === observationSource.observation_source_id
  const isActive = isOpen && urlPath.length === 4

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(`/projects/${project_id}/observation-sources`)
    navigate(
      `/projects/${project_id}/observation-sources/${observationSource.observation_source_id}`,
    )
  }, [isOpen, navigate, project_id, observationSource.observation_source_id])

  // TODO: childrenCount
  return (
    <>
      <Node
        node={observationSource}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={10}
        to={`/projects/${project_id}/observation-sources/${observationSource.observation_source_id}`}
        onClickButton={onClickButton}
      />
      {isOpen && (
        <ObservationsNode
          project_id={project_id}
          observation_source_id={observationSource.observation_source_id}
        />
      )}
    </>
  )
}
