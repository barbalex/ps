import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { Places as Place } from '../../../generated/client/index.ts'
import { OccurrenceAssignedNode } from './OccurrenceAssigned.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'

interface Props {
  project_id: string
  subproject_id: string
  place_id?: string
  place: Place
  level?: number
}

export const OccurrencesAssignedNode = memo(
  ({ project_id, subproject_id, place_id, place, level = 7 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: occurrences = [] } = useLiveQuery(
      db.occurrences.liveMany({
        where: {
          place_id: place.place_id,
        },
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

    const occurrencesNode = useMemo(
      () => ({ label: `Occurrences assigned (${occurrences.length})` }),
      [occurrences.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => [
        'data',
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
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(
      () => [...parentArray, 'occurrences-assigned'],
      [parentArray],
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
      appState?.app_state_id,
      db,
      isInActiveNodeArray,
      isOpen,
      navigate,
      ownArray,
      parentArray,
      parentUrl,
      searchParams,
      urlPath.length,
    ])

    return (
      <>
        <Node
          node={occurrencesNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={occurrences.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          occurrences.map((occurrence) => (
            <OccurrenceAssignedNode
              key={occurrence.occurrence_id}
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place={place}
              occurrence={occurrence}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
