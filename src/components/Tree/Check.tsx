import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Checks as Check, Places as Place } from '../../../generated/client'
import { CheckValuesNode } from './CheckValues'
import { CheckTaxaNode } from './CheckTaxa'

export const CheckNode = ({
  project_id,
  subproject_id,
  place_id,
  check,
  place,
  level = 8,
}: {
  project_id: string
  subproject_id: string
  check: Check
  place: Place
  level: number
}) => {
  const location = useLocation()
  const navigate = useNavigate()

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
      urlPath[9] === check.check_id
    : isOpenBase && urlPath[6] === 'checks' && urlPath[7] === check.check_id
  const isActive = isOpen && urlPath.length === level

  const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/places/${
    place_id ?? place.place_id
  }${place_id ? `/places/${place.place_id}` : ''}/checks`

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(baseUrl)
    navigate(`${baseUrl}/${check.check_id}`)
  }, [isOpen, navigate, baseUrl, check.check_id])

  return (
    <>
      <Node
        node={check}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={10}
        to={`${baseUrl}/${check.check_id}`}
        onClickButton={onClickButton}
      />
      {isOpen && (
        <>
          <CheckValuesNode
            project_id={project_id}
            subproject_id={subproject_id}
            place_id={place_id}
            check_id={check.check_id}
          />
          <CheckTaxaNode
            project_id={project_id}
            subproject_id={subproject_id}
            place_id={place_id}
            check_id={check.check_id}
          />
        </>
      )}
    </>
  )
}
