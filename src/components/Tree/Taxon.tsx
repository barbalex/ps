import { memo, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'
import { Taxa as Taxon } from '../../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id: string
  taxonomy_id: string
  taxon: Taxon
  level?: number
}

export const TaxonNode = memo(
  ({ project_id, taxonomy_id, taxon, level = 6 }: Props) => {
    const location = useLocation()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'taxonomies' &&
      urlPath[4] === taxonomy_id &&
      urlPath[5] === 'taxa' &&
      urlPath[6] === taxon.taxon_id
    const isActive = isOpen && urlPath.length === level + 1

    const ownArray = useMemo(
      () => ['data', 'projects', project_id, 'taxonomies', taxonomy_id, 'taxa'],
      [project_id, taxonomy_id],
    )
    const baseUrl = ownArray.join('/')

    // TODO: childrenCount
    return (
      <Node
        node={taxon}
        id={taxon.taxon_id}
        level={level}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${taxon.taxon_id}`}
      />
    )
  },
)
