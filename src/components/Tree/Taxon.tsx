import { useCallback, memo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Taxa as Taxon } from '../../../generated/client'

type Props = {
  project_id: string
  taxonomy_id: string
  taxon: Taxon
  level?: number
}

export const TaxonNode = memo(
  ({ project_id, taxonomy_id, taxon, level = 6 }: Props) => {
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

    const baseUrl = `/projects/${project_id}/taxonomies/${taxonomy_id}/taxa`

    const onClickButton = useCallback(() => {
      if (isOpen) return navigate(baseUrl)
      navigate(`${baseUrl}/${taxon.taxon_id}`)
    }, [isOpen, navigate, baseUrl, taxon.taxon_id])

    // TODO: childrenCount
    return (
      <Node
        node={taxon}
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
