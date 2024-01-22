import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Taxonomies as Taxonomy } from '../../../generated/client'
import { TaxaNode } from './Taxa'

export const TaxonomyNode = ({
  project_id,
  taxonomy,
  level = 4,
}: {
  project_id: string
  taxonomy: Taxonomy
  level: number
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'taxonomies' &&
    urlPath[3] === taxonomy.taxonomy_id
  const isActive = isOpen && urlPath.length === 4

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(`/projects/${project_id}/taxonomies`)
    navigate(`/projects/${project_id}/taxonomies/${taxonomy.taxonomy_id}`)
  }, [isOpen, navigate, project_id, taxonomy.taxonomy_id])

  return (
    <>
      <Node
        node={taxonomy}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={1}
        to={`/projects/${project_id}/taxonomies/${taxonomy.taxonomy_id}`}
        onClickButton={onClickButton}
      />
      {isOpen && (
        <TaxaNode project_id={project_id} taxonomy_id={taxonomy.taxonomy_id} />
      )}
    </>
  )
}
