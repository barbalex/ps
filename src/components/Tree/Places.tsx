import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { PlaceNode } from './Place/index.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'

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
    const openNodes = useMemo(
      () => appState?.tree_open_nodes ?? [],
      [appState?.tree_open_nodes],
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

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
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
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(() => [...parentArray, 'places'], [parentArray])
    const ownUrl = `/${ownArray.join('/')}`

    // needs to work not only works for urlPath, for all opened paths!
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: parentArray,
          db,
          appStateId: appState?.app_state_id,
        })
        // only navigate if urlPath includes ownArray
        if (isInActiveNodeArray && ownArray.length < urlPath.length) {
          navigate({
            pathname: parentUrl,
            search: searchParams.toString(),
          })
        }
        return
      }
      // add to openNodes without navigating
      addOpenNodes({
        nodes: [ownArray],
        db,
        appStateId: appState?.app_state_id,
      })
    }, [
      isOpen,
      ownArray,
      db,
      appState?.app_state_id,
      parentArray,
      isInActiveNodeArray,
      urlPath.length,
      navigate,
      parentUrl,
      searchParams,
    ])

    return (
      <>
        <Node
          node={placesNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
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
