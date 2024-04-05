import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { ObservationSourceNode } from './ObservationSource'

interface Props {
  project_id: string
  level?: number
}

export const ObservationSourcesNode = memo(
  ({ project_id, level = 3 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const { db } = useElectric()!
    const { results: observationSources = [] } = useLiveQuery(
      db.observation_sources.liveMany({
        where: { project_id },
        orderBy: { label: 'asc' },
      }),
    )

    const observationSourcesNode = useMemo(
      () => ({ label: `Observation Sources (${observationSources.length})` }),
      [observationSources.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'observation-sources'
    const isActive = isOpen && urlPath.length === 3

    const baseUrl = `/projects/${project_id}`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/observation-sources`,
        search: searchParams.toString(),
      })
    }, [baseUrl, isOpen, navigate, searchParams])

    return (
      <>
        <Node
          node={observationSourcesNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={observationSources.length}
          to={`${baseUrl}/observation-sources`}
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
  },
)
