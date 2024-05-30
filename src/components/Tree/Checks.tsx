import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { CheckNode } from './Check.tsx'
import { Places as Place } from '../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'

interface Props {
  project_id: string
  subproject_id: string
  place_id?: string
  place: Place
  level?: number
}

export const ChecksNode = memo(
  ({ project_id, subproject_id, place_id, place, level = 7 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: checks = [] } = useLiveQuery(
      db.checks.liveMany({
        where: { place_id: place.place_id },
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

    // TODO: get name by place_level
    const checksNode = useMemo(
      () => ({ label: `Checks (${checks.length})` }),
      [checks.length],
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
    const baseUrl = parentArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...parentArray, 'checks'],
          db,
          appStateId: appState?.app_state_id,
        })
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/checks`,
        search: searchParams.toString(),
      })
    }, [
      appState?.app_state_id,
      parentArray,
      baseUrl,
      db,
      isOpen,
      navigate,
      searchParams,
    ])

    return (
      <>
        <Node
          node={checksNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={checks.length}
          to={`${baseUrl}/checks`}
          onClickButton={onClickButton}
        />
        {isOpen &&
          checks.map((check) => (
            <CheckNode
              key={check.check_id}
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place={place}
              check={check}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
