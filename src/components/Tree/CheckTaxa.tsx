import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { CheckTaxa as CheckTaxon } from '../../../generated/client'
import { CheckTaxonNode } from './CheckTaxon'

export const CheckTaxaNode = ({
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
    db.check_taxa.liveMany({
      where: { deleted: false, check_id },
      orderBy: { label: 'asc' },
    }),
  )
  const checkTaxa: CheckTaxon[] = results ?? []

  const checkTaxaNode = useMemo(
    () => ({
      label: `Taxa (${checkTaxa.length})`,
    }),
    [checkTaxa.length],
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
    urlPath[8] === 'taxa'
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(
        `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/checks/${check_id}`,
      )
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/checks/${check_id}/taxa`,
    )
  }, [check_id, isOpen, navigate, place_id, project_id, subproject_id])

  return (
    <>
      <Node
        node={checkTaxaNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={checkTaxa.length}
        to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/checks/${check_id}/taxa`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        checkTaxa.map((checkTaxon) => (
          <CheckTaxonNode
            key={checkTaxon.check_taxon_id}
            project_id={project_id}
            subproject_id={subproject_id}
            place_id={place_id}
            check_id={check_id}
            checkTaxon={checkTaxon}
          />
        ))}
    </>
  )
}
