import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Node } from './Node.tsx'
import { ActionReportValuesNode } from './ActionsReportValues.tsx'
import {
  Places as Place,
  Actions_reports as ActionReport,
} from '../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id: string
  subproject_id: string
  place_id: string
  place: Place
  action_id: string
  actionReport: ActionReport
  level?: number
}

export const ActionReportNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place,
    action_id,
    actionReport,
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
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'subprojects' &&
      urlPath[3] === subproject_id &&
      urlPath[4] === 'places' &&
      urlPath[5] === (place_id ?? place.place_id)
    const isOpen = place_id
      ? isOpenBase &&
        urlPath[6] === 'places' &&
        urlPath[7] === place.place_id &&
        urlPath[8] === 'actions' &&
        urlPath[9] === action_id &&
        urlPath[10] === 'reports' &&
        urlPath[11] === actionReport.action_report_id
      : isOpenBase &&
        urlPath[6] === 'actions' &&
        urlPath[7] === action_id &&
        urlPath[8] === 'reports' &&
        urlPath[9] === actionReport.action_report_id
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
        'actions',
        action_id,
        'reports',
      ],
      [project_id, subproject_id, place_id, place.place_id, action_id],
    )
    const baseUrl = baseArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...baseArray, actionReport.action_report_id],
          db,
          appStateId: appState?.app_state_id,
        })
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${actionReport.action_report_id}`,
        search: searchParams.toString(),
      })
    }, [
      isOpen,
      navigate,
      baseUrl,
      actionReport.action_report_id,
      searchParams,
      baseArray,
      db,
      appState?.app_state_id,
    ])

    return (
      <>
        <Node
          node={actionReport}
          id={actionReport.action_report_id}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={1}
          to={`${baseUrl}/${actionReport.action_report_id}`}
          onClickButton={onClickButton}
        />
        {isOpen && (
          <ActionReportValuesNode
            project_id={project_id}
            subproject_id={subproject_id}
            place_id={place_id}
            place={place}
            action_id={action_id}
            action_report_id={actionReport.action_report_id}
            level={level + 1}
          />
        )}
      </>
    )
  },
)
