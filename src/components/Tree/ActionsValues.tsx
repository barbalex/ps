import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { ActionValueNode } from './ActionValue'
import { Places as Place } from '../../generated/client'

interface Props {
  project_id: string
  subproject_id: string
  place_id?: string
  place: Place
  action_id: string
  level?: number
}

export const ActionValuesNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place,
    action_id,
    level = 9,
  }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()

    const { db } = useElectric()!
    const { results: actionValues = [] } = useLiveQuery(
      db.action_values.liveMany({
        where: { deleted: false, action_id },
        orderBy: { label: 'asc' },
      }),
    )

    const actionValuesNode = useMemo(
      () => ({ label: `Action Values (${actionValues.length})` }),
      [actionValues.length],
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
        urlPath[10] === 'values'
      : isOpenBase &&
        urlPath[6] === 'actions' &&
        urlPath[7] === action_id &&
        urlPath[8] === 'values'
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/places/${
      place_id ?? place.place_id
    }${place_id ? `/places/${place.place_id}` : ''}/actions/${action_id}`

    const onClickButton = useCallback(() => {
      if (isOpen) return navigate(baseUrl)
      navigate(`${baseUrl}/values`)
    }, [baseUrl, isOpen, navigate])

    return (
      <>
        <Node
          node={actionValuesNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={actionValues.length}
          to={`${baseUrl}/values`}
          onClickButton={onClickButton}
        />
        {isOpen &&
          actionValues.map((actionValue) => (
            <ActionValueNode
              key={actionValue.action_value_id}
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place={place}
              action_id={action_id}
              actionValue={actionValue}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
