import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { Taxonomies as Taxonomy } from '../../../generated/client'
import { TaxonomyNode } from './Taxonomy'

export const TaxonomiesNode = ({ project_id, level = 3 }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.taxonomies.liveMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    }),
  )
  const taxonomies: Taxonomy[] = results ?? []

  const taxonomiesNode = useMemo(
    () => ({
      label: `Taxonomies (${taxonomies.length})`,
    }),
    [taxonomies.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'taxonomies'
  const isActive = isOpen && urlPath.length === 3

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(`/projects/${project_id}`)
    navigate(`/projects/${project_id}/taxonomies`)
  }, [isOpen, navigate, project_id])

  return (
    <>
      <Node
        node={taxonomiesNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={taxonomies.length}
        to={`/projects/${project_id}/taxonomies`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        taxonomies.map((taxonomy) => (
          <TaxonomyNode
            key={taxonomy.taxonomy_id}
            project_id={project_id}
            taxonomy={taxonomy}
          />
        ))}
    </>
  )
}
