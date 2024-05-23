import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Node } from './Node.tsx'
import {
  Places as Place,
  Actions_values as ActionValue,
} from '../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

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
        urlPath[10] === 'values' &&
        urlPath[11] === actionValue.action_value_id
      : isOpenBase &&
        urlPath[6] === 'actions' &&
        urlPath[7] === action_id &&
        urlPath[8] === 'values' &&
        urlPath[9] === actionValue.action_value_id
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/places/${
      place_id ?? place.place_id
    }${place_id ? `/places/${place.place_id}` : ''}/actions/${action_id}/values`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${actionValue.action_value_id}`,
        search: searchParams.toString(),
      })
    }, [isOpen, navigate, baseUrl, actionValue.action_value_id, searchParams])

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
