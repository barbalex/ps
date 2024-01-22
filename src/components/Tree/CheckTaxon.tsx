import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'

export const CheckTaxonNode = ({
  project_id,
  subproject_id,
  place_id,
  check_id,
  checkTaxon,
  level = 10,
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
    urlPath[7] === check_id &&
    urlPath[8] === 'taxa' &&
    urlPath[9] === checkTaxon.check_taxon_id
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(
        `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/checks/${check_id}/taxa`,
      )
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/checks/${check_id}/taxa/${checkTaxon.check_taxon_id}`,
    )
  }, [
    isOpen,
    navigate,
    project_id,
    subproject_id,
    place_id,
    check_id,
    checkTaxon.check_taxon_id,
  ])

  return (
    <Node
      node={checkTaxon}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/checks/${check_id}/taxa/${checkTaxon.check_taxon_id}`}
      onClickButton={onClickButton}
    />
  )
}
