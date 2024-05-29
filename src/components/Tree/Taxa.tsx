import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { TaxonNode } from './Taxon.tsx'

interface Props {
  project_id: string
  taxonomy_id: string
  level?: number
}

export const TaxaNode = memo(
  ({ project_id, taxonomy_id, level = 5 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const { db } = useElectric()!
    const { results: taxa = [] } = useLiveQuery(
      db.taxa.liveMany({
        where: { taxonomy_id },
        orderBy: { label: 'asc' },
      }),
    )

    const taxaNode = useMemo(
      () => ({ label: `Taxa (${taxa.length})` }),
      [taxa.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'taxonomies' &&
      urlPath[4] === taxonomy_id &&
      urlPath[5] === 'taxa'
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/data/projects/${project_id}/taxonomies/${taxonomy_id}`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({ pathname: `${baseUrl}/taxa`, search: searchParams.toString() })
    }, [isOpen, navigate, baseUrl, searchParams])

    return (
      <>
        <Node
          node={taxaNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={taxa.length}
          to={`${baseUrl}/taxa`}
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
  },
)
