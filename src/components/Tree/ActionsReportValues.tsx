import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useCorbado } from '@corbado/react'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { ActionReportValueNode } from './ActionReportValue.tsx'
import { Places as Place } from '../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id: string
  subproject_id: string
  place_id?: string
  place: Place
  action_id: string
  action_report_id: string
  level?: number
}

export const ActionReportValuesNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place,
    action_id,
    action_report_id,
    level = 11,
  }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: actionReportValues = [] } = useLiveQuery(
      db.action_report_values.liveMany({
        where: { action_report_id },
        orderBy: { label: 'asc' },
      }),
    )
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )

    const actionReportValuesNode = useMemo(
      () => ({ label: `Values (${actionReportValues.length})` }),
      [actionReportValues.length],
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
        urlPath[11] === 'reports' &&
        urlPath[12] === action_report_id &&
        urlPath[13] === 'values'
      : isOpenBase &&
        urlPath[7] === 'actions' &&
        urlPath[8] === action_id &&
        urlPath[9] === 'reports' &&
        urlPath[10] === action_report_id &&
        urlPath[11] === 'values'
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
        action_report_id,
      ],
      [
        action_id,
        action_report_id,
        place.place_id,
        place_id,
        project_id,
        subproject_id,
      ],
    )
    const baseUrl = baseArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...baseArray],
          db,
          appStateId: appState?.app_state_id,
        })
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/values`,
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
          node={actionReportValuesNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={actionReportValues.length}
          to={`${baseUrl}/values`}
          onClickButton={onClickButton}
        />
        {isOpen &&
          actionReportValues.map((actionReportValue) => (
            <ActionReportValueNode
              key={actionReportValue.action_report_value_id}
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place={place}
              action_id={action_id}
              action_report_id={action_report_id}
              actionReportValue={actionReportValue}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
