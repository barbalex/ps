import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { PlaceLevelNode } from './PlaceLevel'

interface Props {
  project_id: string
  level?: number
}

export const PlaceLevelsNode = memo(({ project_id, level = 3 }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: placeLevels = [] } = useLiveQuery(
    db.place_levels.liveMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    }),
  )

  const placeLevelsNode = useMemo(
    () => ({ label: `Place Levels (${placeLevels.length})` }),
    [placeLevels.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'place-levels'
  const isActive = isOpen && urlPath.length === 3

  const baseUrl = `/projects/${project_id}`

  const onClickButton = useCallback(() => {
    if (isOpen) {
      return navigate({ pathname: baseUrl, search: searchParams.toString() })
    }
    navigate({
      pathname: `${baseUrl}/place-levels`,
      search: searchParams.toString(),
    })
  }, [baseUrl, isOpen, navigate, searchParams])

  return (
    <>
      <Node
        node={placeLevelsNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={placeLevels.length}
        to={`${baseUrl}/place-levels`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        placeLevels.map((placeLevel) => (
          <PlaceLevelNode
            key={placeLevel.place_level_id}
            project_id={project_id}
            placeLevel={placeLevel}
          />
        ))}
    </>
  )
})
