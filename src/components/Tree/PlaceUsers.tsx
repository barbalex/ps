import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { Places as Place } from '../../../generated/client/index.ts'
import { PlaceUserNode } from './PlaceUser.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id: string
  subproject_id: string
  place_id?: string
  place: Place
  level?: number
}

export const PlaceUsersNode = memo(
  ({ project_id, subproject_id, place_id, place, level = 7 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: placeUsers = [] } = useLiveQuery(
      db.place_users.liveMany({
        where: { place_id: place.place_id },
        orderBy: { label: 'asc' },
      }),
    )
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )

    const placeUsersNode = useMemo(
      () => ({ label: `Users (${placeUsers.length})` }),
      [placeUsers.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpenBase =
      urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'subprojects' &&
      urlPath[4] === subproject_id &&
      urlPath[5] === 'places' &&
      urlPath[6] === (place_id ?? place.place_id)
    const isOpen = place_id
      ? isOpenBase &&
        urlPath[7] === 'places' &&
        urlPath[8] === place.place_id &&
        urlPath[9] === 'users'
      : isOpenBase && urlPath[7] === 'users'
    const isActive = isOpen && urlPath.length === level

    const baseArray = useMemo(
      () => [
        'projects',
        project_id,
        'subprojects',
        subproject_id,
        'places',
        place_id ?? place.place_id,
        ...(place_id ? ['places', place.place_id] : []),
      ],
      [project_id, subproject_id, place_id, place.place_id],
    )
    const baseUrl = baseArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...baseArray, 'users'],
          db,
          appStateId: appState?.app_state_id,
        })
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/users`,
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
          node={placeUsersNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={placeUsers.length}
          to={`${baseUrl}/users`}
          onClickButton={onClickButton}
        />
        {isOpen &&
          placeUsers.map((placeUser) => (
            <PlaceUserNode
              key={placeUser.place_id}
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place={place}
              placeUser={placeUser}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
