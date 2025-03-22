import { memo, useMemo } from 'react'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'

export const CheckTaxonNode = memo(
  ({
    projectId,
    subprojectId,
    placeId,
    place,
    checkId,
    checkTaxon,
    level = 10,
  }) => {
    const location = useLocation()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const ownArray = useMemo(
      () => [
        'data',
        'projects',
        projectId,
        'subprojects',
        subprojectId,
        'places',
        placeId ?? place.place_id,
        ...(placeId ? ['places', place.place_id] : []),
        'checks',
        checkId,
        'taxa',
        checkTaxon.check_taxon_id,
      ],
      [
        checkTaxon.check_taxon_id,
        checkId,
        place.place_id,
        placeId,
        projectId,
        subprojectId,
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
