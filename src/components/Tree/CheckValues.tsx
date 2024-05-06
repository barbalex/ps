import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { Places as Place } from '../../../generated/client/index.ts'
import { CheckValueNode } from './CheckValue.tsx'

interface Props {
  project_id: string
  subproject_id: string
  place_id?: string
  place: Place
  check_id: string
  level?: number
}

export const CheckValuesNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place,
    check_id,
    level = 9,
  }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const { db } = useElectric()!
    const { results: checkValues = [] } = useLiveQuery(
      db.check_values.liveMany({
        where: { check_id },
        orderBy: { label: 'asc' },
      }),
    )

    const checkValuesNode = useMemo(
      () => ({ label: `Values (${checkValues.length})` }),
      [checkValues.length],
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
        urlPath[8] === 'checks' &&
        urlPath[9] === check_id &&
        urlPath[10] === 'values'
      : isOpenBase &&
        urlPath[6] === 'checks' &&
        urlPath[7] === check_id &&
        urlPath[8] === 'values'
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/places/${
      place_id ?? place.place_id
    }${place_id ? `/places/${place.place_id}` : ''}/checks/${check_id}`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/values`,
        search: searchParams.toString(),
      })
    }, [baseUrl, isOpen, navigate, searchParams])

    return (
      <>
        <Node
          node={checkValuesNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={checkValues.length}
          to={`${baseUrl}/values`}
          onClickButton={onClickButton}
        />
        {isOpen &&
          checkValues.map((checkValue) => (
            <CheckValueNode
              key={checkValue.check_value_id}
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place={place}
              check_id={check_id}
              checkValue={checkValue}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
