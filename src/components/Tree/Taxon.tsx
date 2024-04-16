import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { Node } from './Node'
import { Taxa as Taxon } from '../../../generated/client'

interface Props {
  project_id: string
  taxonomy_id: string
  taxon: Taxon
  level?: number
}

export const TaxonNode = memo(
  ({ project_id, taxonomy_id, taxon, level = 6 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'taxonomies' &&
      urlPath[3] === taxonomy_id &&
      urlPath[4] === 'taxa' &&
      urlPath[5] === taxon.taxon_id
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/taxonomies/${taxonomy_id}/taxa`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${taxon.taxon_id}`,
        search: searchParams.toString(),
      })
    }, [isOpen, navigate, baseUrl, taxon.taxon_id, searchParams])

    // TODO: childrenCount
    return (
      <Node
        node={taxon}
        id={taxon.taxon_id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${taxon.taxon_id}`}
        onClickButton={onClickButton}
      />
    )
  },
)
