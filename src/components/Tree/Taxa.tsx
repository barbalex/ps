import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { Taxa as Taxon } from '../../../generated/client'
import { TaxonNode } from './Taxon'

export const TaxaNode = ({ project_id, taxonomy_id, level = 5 }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.taxa.liveMany({
      where: { deleted: false, taxonomy_id },
      orderBy: { label: 'asc' },
    }),
  )
  const taxa: Taxon[] = results ?? []

  const taxaNode = useMemo(
    () => ({
      label: `Taxa (${taxa.length})`,
    }),
    [taxa.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'taxonomies' &&
    urlPath[3] === taxonomy_id &&
    urlPath[4] === 'taxa'
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(`/projects/${project_id}/taxonomies/${taxonomy_id}`)
    navigate(`/projects/${project_id}/taxonomies/${taxonomy_id}/taxa`)
  }, [isOpen, navigate, taxonomy_id, project_id])

  return (
    <>
      <Node
        node={taxaNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={taxa.length}
        to={`/projects/${project_id}/taxonomies/${taxonomy_id}/taxa`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        taxa.map((taxon) => (
          <TaxonNode
            key={taxon.taxon_id}
            project_id={project_id}
            taxonomy_id={taxonomy_id}
            taxon={taxon}
          />
        ))}
    </>
  )
}
