import { memo, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'
import {
  Places as Place,
  Check_taxa as CheckTaxon,
} from '../../generated/client/index.ts'

interface Props {
  project_id: string
  subproject_id: string
  place_id: string
  place: Place
  check_id: string
  checkTaxon: CheckTaxon
  level?: number
}

export const CheckTaxonNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place,
    check_id,
    checkTaxon,
    level = 10,
  }: Props) => {
    const location = useLocation()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const ownArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'subprojects',
        subproject_id,
        'places',
        place_id ?? place.place_id,
        ...(place_id ? ['places', place.place_id] : []),
        'checks',
        check_id,
        'taxa',
        checkTaxon.check_taxon_id,
      ],
      [
        checkTaxon.check_taxon_id,
        check_id,
        place.place_id,
        place_id,
        project_id,
        subproject_id,
      ],
    )
    const ownUrl = `/${ownArray.join('/')}`

    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return (
      <Node
        node={checkTaxon}
        id={checkTaxon.check_taxon_id}
        level={level}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={0}
        to={ownUrl}
      />
    )
  },
)
