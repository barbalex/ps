import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Node } from '../Node.tsx'
import { Places as Place } from '../../../generated/client/index.ts'
import { PlaceChildren } from './Children.tsx'
import { removeChildNodes } from '../../../modules/tree/removeChildNodes.ts'
import { useElectric } from '../../../ElectricProvider.tsx'

interface Props {
  project_id: string
  subproject_id: string
  place_id?: string
  place: Place
}

export const PlaceNode = memo(
  ({ project_id, subproject_id, place_id, place }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )

    const level = place_id ? 8 : 6
    const place_id1 = place_id ?? place.place_id
    const place_id2 = place_id ? place.place_id : undefined

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpenBase =
      urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'subprojects' &&
      urlPath[4] === subproject_id &&
      urlPath[5] === 'places'
    const isOpen = place_id
      ? isOpenBase &&
        urlPath[6] === place_id &&
        urlPath[7] === 'places' &&
        urlPath[8] === place.place_id
      : isOpenBase && urlPath[6] === place.place_id
    const isActive = isOpen && urlPath.length === level + 1

    const baseArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'subprojects',
        subproject_id,
        'places',
        ...(place_id2 ? [place_id1, 'places'] : []),
      ],
      [place_id1, place_id2, project_id, subproject_id],
    )
    const baseUrl = baseArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...baseArray, place.place_id],
          db,
          appStateId: appState?.app_state_id,
        })
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${place.place_id}`,
        search: searchParams.toString(),
      })
    }, [
      appState?.app_state_id,
      baseArray,
      baseUrl,
      db,
      isOpen,
      navigate,
      place.place_id,
      searchParams,
    ])

    return (
      <>
        <Node
          node={place}
          id={place.place_id}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={10}
          to={`${baseUrl}/${place.place_id}`}
          onClickButton={onClickButton}
        />
        {isOpen && (
          <PlaceChildren
            project_id={project_id}
            subproject_id={subproject_id}
            place_id={place_id}
            place={place}
            level={level}
          />
        )}
      </>
    )
  },
)
