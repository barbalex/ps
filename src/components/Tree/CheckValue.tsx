import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { Node } from './Node'
import {
  Check_values as CheckValue,
  Places as Place,
} from '../../generated/client'

interface Props {
  project_id: string
  subproject_id: string
  place_id: string
  place: Place
  check_id: string
  checkValue: CheckValue
  level?: number
}

export const CheckValueNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place,
    check_id,
    checkValue,
    level = 10,
  }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

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
        urlPath[8] === 'checks' &&
        urlPath[9] === check_id &&
        urlPath[10] === 'values' &&
        urlPath[11] === checkValue.check_value_id
      : isOpenBase &&
        urlPath[6] === 'checks' &&
        urlPath[7] === check_id &&
        urlPath[8] === 'values' &&
        urlPath[9] === checkValue.check_value_id
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/places/${
      place_id ?? place.place_id
    }${place_id ? `/places/${place.place_id}` : ''}/checks/${check_id}/values`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${checkValue.check_value_id}`,
        search: searchParams.toString(),
      })
    }, [isOpen, navigate, baseUrl, checkValue.check_value_id, searchParams])

    return (
      <Node
        node={checkValue}
        id={checkValue.check_value_id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${checkValue.check_value_id}`}
        onClickButton={onClickButton}
      />
    )
  },
)
