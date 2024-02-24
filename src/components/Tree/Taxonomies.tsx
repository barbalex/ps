import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { TaxonomyNode } from './Taxonomy'

type Props = {
  project_id: string
  level?: number
}

export const TaxonomiesNode = memo(({ project_id, level = 3 }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results: taxonomies = [] } = useLiveQuery(
    db.taxonomies.liveMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    }),
  )

  const taxonomiesNode = useMemo(
    () => ({ label: `Taxonomies (${taxonomies.length})` }),
    [taxonomies.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'taxonomies'
  const isActive = isOpen && urlPath.length === 3

  const baseUrl = `/projects/${project_id}`

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(baseUrl)
    navigate(`${baseUrl}/taxonomies`)
  }, [baseUrl, isOpen, navigate])

  return (
    <>
      <Node
        node={taxonomiesNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={taxonomies.length}
        to={`${baseUrl}/taxonomies`}
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
})
