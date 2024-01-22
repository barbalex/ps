import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Taxa as Taxon } from '../../../generated/client'

export const TaxonNode = ({
  project_id,
  taxonomy_id,
  taxon,
  level = 6,
}: {
  project_id: string
  taxon: Taxon
  level: number
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'taxonomies' &&
    urlPath[3] === taxonomy_id &&
    urlPath[4] === 'taxa' &&
    urlPath[5] === taxon.taxon_id
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(
        `/projects/${project_id}/taxonomies/${taxonomy_id}/taxa`,
      )
    navigate(
      `/projects/${project_id}/taxonomies/${taxonomy_id}/taxa/${taxon.taxon_id}`,
    )
  }, [
    isOpen,
    navigate,
    project_id,
    taxonomy_id,
    taxon.taxon_id,
  ])

  // TODO: childrenCount
  return (
    <Node
      node={taxon}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/projects/${project_id}/taxonomies/${taxonomy_id}/taxa/${taxon.taxon_id}`}
      onClickButton={onClickButton}
    />
  )
}
