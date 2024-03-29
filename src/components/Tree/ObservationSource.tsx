import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { Node } from './Node'
import { ObservationSources as ObservationSource } from '../../../generated/client'
import { ObservationsNode } from './Observations'

interface Props {
  project_id: string
  observationSource: ObservationSource
  level?: number
}

export const ObservationSourceNode = memo(
  ({ project_id, observationSource, level = 4 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'observation-sources' &&
      urlPath[3] === observationSource.observation_source_id
    const isActive = isOpen && urlPath.length === 4

    const baseUrl = `/projects/${project_id}/observation-sources`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${observationSource.observation_source_id}`,
        search: searchParams.toString(),
      })
    }, [
      isOpen,
      navigate,
      baseUrl,
      observationSource.observation_source_id,
      searchParams,
    ])

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
          to={`${baseUrl}/${observationSource.observation_source_id}`}
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
  },
)
