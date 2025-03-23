import { useCallback, useMemo, memo } from 'react'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'

import { Node } from './Node.tsx'
import { CheckTaxonNode } from './CheckTaxon.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import { treeOpenNodesAtom } from '../../store.ts'

export const CheckTaxaNode = memo(
  ({ projectId, subprojectId, placeId, place, checkId, level = 9 }) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const location = useLocation()
    const navigate = useNavigate()

    const res = useLiveIncrementalQuery(
      `
      SELECT
        check_taxon_id,
        label
      FROM check_taxa 
      WHERE check_id = $1 
      ORDER BY label`,
      [checkId],
      'check_taxon_id',
    )
    const rows = res?.rows ?? []
    const loading = res === undefined

    const node = useMemo(
      () => ({
        label: `Taxa (${loading ? '...' : formatNumber(rows.length)})`,
      }),
      [loading, rows.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
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
      ],
      [checkId, place.place_id, placeId, projectId, subprojectId],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(() => [...parentArray, 'taxa'], [parentArray])
    const ownUrl = `/${ownArray.join('/')}`

    // needs to work not only works for urlPath, for all opened paths!
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({ node: ownArray })
        // only navigate if urlPath includes ownArray
        if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
          navigate({ to: parentUrl })
        }
        return
      }
      // add to openNodes without navigating
      addOpenNodes({ nodes: [ownArray] })
    }, [
      isInActiveNodeArray,
      isOpen,
      navigate,
      ownArray,
      parentUrl,
      urlPath.length,
    ])

    return (
      <>
        <Node
          node={node}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={rows.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          rows.map((checkTaxon) => (
            <CheckTaxonNode
              key={checkTaxon.check_taxon_id}
              projectId={projectId}
              subprojectId={subprojectId}
              placeId={placeId}
              place={place}
              checkId={checkId}
              checkTaxon={checkTaxon}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
