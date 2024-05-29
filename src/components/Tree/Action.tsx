import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Node } from './Node.tsx'
import {
  Actions as Action,
  Places as Place,
} from '../../../generated/client/index.ts'
import { ActionValuesNode } from './ActionsValues.tsx'
import { ActionReportsNode } from './ActionsReports.tsx'
import { FilesNode } from './Files.tsx'
import { useElectric } from '../../ElectricProvider.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id: string
  subproject_id: string
  place_id: string
  action: Action
  place: Place
  level?: number
}

export const ActionNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    action,
    place,
    level = 8,
  }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    // need project to know whether to show files
    const { db } = useElectric()!
    const { results: project } = useLiveQuery(
      db.projects.liveUnique({ where: { project_id } }),
    )
    const showFiles = project?.files_active_actions ?? false
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
        urlPath[10] === action.action_id
      : isOpenBase &&
        urlPath[7] === 'actions' &&
        urlPath[8] === action.action_id
    const isActive = isOpen && urlPath.length === level

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
      ],
      [place.place_id, place_id, project_id, subproject_id],
    )
    const baseUrl = baseArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...baseArray, action.action_id],
          db,
          appStateId: appState?.app_state_id,
        })
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${action.action_id}`,
        search: searchParams.toString(),
      })
    }, [
      isOpen,
      navigate,
      baseUrl,
      action.action_id,
      searchParams,
      baseArray,
      db,
      appState?.app_state_id,
    ])

    return (
      <>
        <Node
          node={action}
          id={action.action_id}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={10}
          to={`${baseUrl}/${action.action_id}`}
          onClickButton={onClickButton}
        />
        {isOpen && (
          <>
            <ActionValuesNode
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place={place}
              action_id={action.action_id}
              level={level + 1}
            />
            <ActionReportsNode
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place={place}
              action_id={action.action_id}
              level={level + 1}
            />
            {showFiles && (
              <FilesNode
                project_id={project_id}
                subproject_id={subproject_id}
                place_id={place_id ?? place.place_id}
                place_id2={place_id ? place.place_id : undefined}
                action_id={action.action_id}
                level={level + 1}
              />
            )}
          </>
        )}
      </>
    )
  },
)
