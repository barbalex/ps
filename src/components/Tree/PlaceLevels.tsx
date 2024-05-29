import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { PlaceLevelNode } from './PlaceLevel.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id: string
  level?: number
}

export const PlaceLevelsNode = memo(({ project_id, level = 3 }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: placeLevels = [] } = useLiveQuery(
    db.place_levels.liveMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    }),
  )
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  const placeLevelsNode = useMemo(
    () => ({ label: `Place Levels (${placeLevels.length})` }),
    [placeLevels.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[1] === 'projects' &&
    urlPath[2] === project_id &&
    urlPath[3] === 'place-levels'
  const isActive = isOpen && urlPath.length === 3

  const baseArray = useMemo(
    () => ['data', 'projects', project_id],
    [project_id],
  )
  const baseUrl = baseArray.join('/')

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: [...baseArray, 'place-levels'],
        db,
        appStateId: appState?.app_state_id,
      })
      return navigate({ pathname: baseUrl, search: searchParams.toString() })
    }
    navigate({
      pathname: `${baseUrl}/place-levels`,
      search: searchParams.toString(),
    })
  }, [
    appState?.app_state_id,
    baseArray,
    baseUrl,
    db,
    isOpen,
    navigate,
    searchParams,
  ])

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
