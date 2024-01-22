import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { SubprojectTaxa as SubprojectTaxon } from '../../../generated/client'
import { SubprojectTaxonNode } from './SubprojectTaxon'

export const SubprojectTaxaNode = ({
  project_id,
  subproject_id,
  level = 5,
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.subproject_taxa.liveMany({
      where: { deleted: false, subproject_id },
      orderBy: { label: 'asc' },
    }),
  )
  const subprojectTaxa: SubprojectTaxon[] = results ?? []

  const subprojectTaxaNode = useMemo(
    () => ({
      label: `Taxa (${subprojectTaxa.length})`,
    }),
    [subprojectTaxa.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'subprojects' &&
    urlPath[3] === subproject_id &&
    urlPath[4] === 'taxa'
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(`/projects/${project_id}/subprojects/${subproject_id}`)
    navigate(`/projects/${project_id}/subprojects/${subproject_id}/taxa`)
  }, [isOpen, navigate, project_id, subproject_id])

  return (
    <>
      <Node
        node={subprojectTaxaNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={subprojectTaxa.length}
        to={`/projects/${project_id}/subprojects/${subproject_id}/taxa`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        subprojectTaxa.map((subprojectTaxon) => (
          <SubprojectTaxonNode
            key={subprojectTaxon.subproject_taxon_id}
            project_id={project_id}
            subproject_id={subproject_id}
            subprojectTaxon={subprojectTaxon}
          />
        ))}
    </>
  )
}
