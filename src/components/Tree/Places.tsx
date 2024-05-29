import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { PlaceNode } from './Place/index.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id: string
  subproject_id: string
  place_id?: string
}

export const PlacesNode = memo(
  ({ project_id, subproject_id, place_id }: Props) => {
    const level = place_id ? 7 : 5
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: places = [] } = useLiveQuery(
      db.places.liveMany({
        where: { parent_id: place_id ?? null, subproject_id },
        orderBy: { label: 'asc' },
      }),
    )
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )

    const { results: placeLevels } = useLiveQuery(
      db.place_levels.liveMany({
        where: {
          project_id,
          level: place_id ? 2 : 1,
        },
        orderBy: { label: 'asc' },
      }),
    )
    const placeNamePlural = placeLevels?.[0]?.name_plural ?? 'Places'

    // get name by place_level
    const placesNode = useMemo(
      () => ({ label: `${placeNamePlural} (${places.length})` }),
      [placeNamePlural, places.length],
    )

    const parentArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'subprojects',
        subproject_id,
        ...(place_id ? ['places', place_id] : []),
      ],
      [place_id, project_id, subproject_id],
    )
    const parentUrl = parentArray.join('/')
    const ownArray = useMemo(() => [...parentArray, 'places'], [parentArray])
    const ownUrl = ownArray.join('/')

    const urlPath = location.pathname.split('/').filter((p) => p !== '')

    // isOpen if urlPath includes the parentArray
    const isOpen = parentArray.every((part, i) => urlPath[i] === part)

    const isActive = isOpen && urlPath.length === level + 1

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: parentArray,
          db,
          appStateId: appState?.app_state_id,
        })
        return navigate({
          pathname: parentUrl,
          search: searchParams.toString(),
        })
      }
      navigate({
        pathname: ownUrl,
        search: searchParams.toString(),
      })
    }, [
      isOpen,
      navigate,
      ownUrl,
      searchParams,
      parentArray,
      db,
      appState?.app_state_id,
      parentUrl,
    ])

    return (
      <>
        <Node
          node={placesNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={places.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          places.map((place) => (
            <PlaceNode
              key={place.place_id}
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place={place}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
