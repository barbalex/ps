import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Node } from './Node.tsx'
import {
  Places as Place,
  Actions_values as ActionValue,
} from '../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { useElectric } from '../../ElectricProvider.tsx'

interface Props {
  project_id: string
  subproject_id: string
  place_id: string
  place: Place
  action_id: string
  actionValue: ActionValue
  level?: number
}

export const ActionValueNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place,
    action_id,
    actionValue,
    level = 10,
  }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
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
        urlPath[9] === 'actions' &&
        urlPath[10] === action_id &&
        urlPath[11] === 'values' &&
        urlPath[12] === actionValue.action_value_id
      : isOpenBase &&
        urlPath[7] === 'actions' &&
        urlPath[8] === action_id &&
        urlPath[9] === 'values' &&
        urlPath[10] === actionValue.action_value_id
    const isActive = isOpen && urlPath.length === level + 1

    const baseArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'subprojects',
        subproject_id,
        'places',
        place_id ?? place.place_id,
        ...(place_id ? ['places', place.place_id] : []),
        'actions',
        action_id,
        'values',
      ],
      [action_id, place.place_id, place_id, project_id, subproject_id],
    )
    const baseUrl = baseArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...baseArray, actionValue.action_value_id],
          db,
          appStateId: appState?.app_state_id,
        })
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${actionValue.action_value_id}`,
        search: searchParams.toString(),
      })
    }, [
      isOpen,
      navigate,
      baseUrl,
      actionValue.action_value_id,
      searchParams,
      baseArray,
      db,
      appState?.app_state_id,
    ])

    return (
      <Node
        node={actionValue}
        id={actionValue.action_value_id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${actionValue.action_value_id}`}
        onClickButton={onClickButton}
      />
    )
  },
)
