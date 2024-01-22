import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { CheckValues as CheckValue } from '../../../generated/client'
import { CheckValueNode } from './CheckValue'

export const CheckValuesNode = ({
  project_id,
  subproject_id,
  place_id,
  check_id,
  level = 9,
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.check_values.liveMany({
      where: { deleted: false, check_id },
      orderBy: { label: 'asc' },
    }),
  )
  const checkValues: CheckValue[] = results ?? []

  const checkValuesNode = useMemo(
    () => ({
      label: `Check Values (${checkValues.length})`,
    }),
    [checkValues.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'subprojects' &&
    urlPath[3] === subproject_id &&
    urlPath[4] === 'places' &&
    urlPath[5] === place_id &&
    urlPath[6] === 'checks' &&
    urlPath[7] === check_id &&
    urlPath[8] === 'values'
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(
        `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/checks/${check_id}`,
      )
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/checks/${check_id}/values`,
    )
  }, [check_id, isOpen, navigate, place_id, project_id, subproject_id])

  return (
    <>
      <Node
        node={checkValuesNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={checkValues.length}
        to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/checks/${check_id}/values`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        checkValues.map((checkValue) => (
          <CheckValueNode
            key={checkValue.check_value_id}
            project_id={project_id}
            subproject_id={subproject_id}
            place_id={place_id}
            check_id={check_id}
            checkValue={checkValue}
          />
        ))}
    </>
  )
}
