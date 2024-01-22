import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Checks as Check } from '../../../generated/client'
import { CheckValuesNode } from './ChecksValues'
import { CheckReportsNode } from './ChecksReports'

export const CheckNode = ({
  project_id,
  subproject_id,
  place_id,
  check,
  level = 8,
}: {
  project_id: string
  subproject_id: string
  check: Check
  level: number
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'subprojects' &&
    urlPath[3] === subproject_id &&
    urlPath[4] === 'places' &&
    urlPath[5] === place_id &&
    urlPath[6] === 'checks' &&
    urlPath[7] === check.check_id
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(
        `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/checks`,
      )
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/checks/${check.check_id}`,
    )
  }, [isOpen, navigate, check.check_id, place_id, project_id, subproject_id])

  return (
    <>
      <Node
        node={check}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={10}
        to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/checks/${check.check_id}`}
        onClickButton={onClickButton}
      />
      {/* {isOpen && (
        <>
          <CheckValuesNode
            project_id={project_id}
            subproject_id={subproject_id}
            place_id={place_id}
            check_id={check.check_id}
          />
          <CheckReportsNode
            project_id={project_id}
            subproject_id={subproject_id}
            place_id={place_id}
            check_id={check.check_id}
          />
        </>
      )} */}
    </>
  )
}
