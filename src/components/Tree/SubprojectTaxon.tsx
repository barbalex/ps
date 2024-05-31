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
    const isOpen =
      urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'subprojects' &&
      urlPath[4] === subproject_id &&
      urlPath[5] === 'taxa' &&
      urlPath[6] === subprojectTaxon.subproject_taxon_id
    const isActive = isOpen && urlPath.length === level + 1

    const baseArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'subprojects',
        subproject_id,
        'taxa',
      ],
      [project_id, subproject_id],
    )
    const baseUrl = baseArray.join('/')

    return (
      <Node
        node={subprojectTaxon}
        id={subprojectTaxon.subproject_taxon_id}
        level={level}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${subprojectTaxon.subproject_taxon_id}`}
      />
    )
  },
)
