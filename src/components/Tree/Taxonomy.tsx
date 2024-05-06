import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { Node } from './Node.tsx'
import { Taxonomies as Taxonomy } from '../../../generated/client/index.ts'
import { TaxaNode } from './Taxa'

interface Props {
  project_id: string
  taxonomy: Taxonomy
  level?: number
}

export const TaxonomyNode = memo(
  ({ project_id, taxonomy, level = 4 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'taxonomies' &&
      urlPath[3] === taxonomy.taxonomy_id
    const isActive = isOpen && urlPath.length === 4

    const baseUrl = `/projects/${project_id}/taxonomies`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${taxonomy.taxonomy_id}`,
        search: searchParams.toString(),
      })
    }, [baseUrl, isOpen, navigate, searchParams, taxonomy.taxonomy_id])

    return (
      <>
        <Node
          node={taxonomy}
          id={taxonomy.taxonomy_id}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={1}
          to={`${baseUrl}/${taxonomy.taxonomy_id}`}
          onClickButton={onClickButton}
        />
        {isOpen && (
          <TaxaNode
            project_id={project_id}
            taxonomy_id={taxonomy.taxonomy_id}
          />
        )}
      </>
    )
  },
)
