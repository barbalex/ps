import { memo, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'
import { Taxa as Taxon } from '../../../generated/client/index.ts'

interface Props {
  project_id: string
  taxonomy_id: string
  taxon: Taxon
  level?: number
}

export const TaxonNode = memo(
  ({ project_id, taxonomy_id, taxon, level = 6 }) => {
    const location = useLocation()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const ownArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'taxonomies',
        taxonomy_id,
        'taxa',
        taxon.taxon_id,
      ],
      [project_id, taxon.taxon_id, taxonomy_id],
    )
    const ownUrl = `/${ownArray.join('/')}`

    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return (
      <Node
        node={taxon}
        id={taxon.taxon_id}
        level={level}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={0}
        to={ownUrl}
      />
    )
  },
)
