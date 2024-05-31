import { memo, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'
import { SubprojectTaxa as SubprojectTaxon } from '../../../generated/client/index.ts'

interface Props {
  project_id: string
  subproject_id: string
  subprojectTaxon: SubprojectTaxon
  level?: number
}

export const SubprojectTaxonNode = memo(
  ({ project_id, subproject_id, subprojectTaxon, level = 6 }: Props) => {
    const location = useLocation()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const ownArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'subprojects',
        subproject_id,
        'taxa',
        subprojectTaxon.subproject_taxon_id,
      ],
      [project_id, subprojectTaxon.subproject_taxon_id, subproject_id],
    )
    const ownUrl = `/${ownArray.join('/')}`

    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return (
      <Node
        node={subprojectTaxon}
        id={subprojectTaxon.subproject_taxon_id}
        level={level}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={0}
        to={ownUrl}
      />
    )
  },
)
