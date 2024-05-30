import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import isEqual from 'lodash/isEqual'

import { Node } from '../Node.tsx'
import { Places as Place } from '../../../generated/client/index.ts'
import { PlaceChildren } from './Children.tsx'
import { removeChildNodes } from '../../../modules/tree/removeChildNodes.ts'
import { useElectric } from '../../../ElectricProvider.tsx'
import { addOpenNodes } from '../../../modules/tree/addOpenNodes.ts'

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
    const openNodes = useMemo(
      () => appState?.tree_open_nodes ?? [],
      [appState?.tree_open_nodes],
    )

    const level = place_id ? 8 : 6
    const place_id1 = place_id ?? place.place_id
    const place_id2 = place_id ? place.place_id : undefined

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
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
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(
      () => [...parentArray, place.place_id],
      [parentArray, place.place_id],
    )
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
        if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
          navigate({ pathname: parentUrl, search: searchParams.toString() })
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
      isInActiveNodeArray,
      db,
      appState?.app_state_id,
      parentArray,
      urlPath.length,
      navigate,
      parentUrl,
      searchParams,
    ])

    return (
      <>
        <Node
          node={place}
          id={place.place_id}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={10}
          to={ownUrl}
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
