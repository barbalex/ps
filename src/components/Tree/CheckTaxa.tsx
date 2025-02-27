import { useCallback, useMemo, memo } from 'react'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'

import { Node } from './Node.tsx'
import { CheckTaxonNode } from './CheckTaxon.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

export const CheckTaxaNode = memo(
  ({ project_id, subproject_id, place_id, place, check_id, level = 9 }) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const res = useLiveIncrementalQuery(
      `SELECT * FROM check_taxa WHERE check_id = $1 ORDER BY label asc`,
      [check_id],
      'check_taxon_id',
    )
    const checkTaxa = res?.rows ?? []

    const checkTaxaNode = useMemo(
      () => ({ label: `Taxa (${checkTaxa.length})` }),
      [checkTaxa.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
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
      ],
      [check_id, place.place_id, place_id, project_id, subproject_id],
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
          navigate({
            pathname: parentUrl,
            search: searchParams.toString(),
          })
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
      parentArray,
      parentUrl,
      searchParams,
      urlPath.length,
    ])

    return (
      <>
        <Node
          node={checkTaxaNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={checkTaxa.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          checkTaxa.map((checkTaxon) => (
            <CheckTaxonNode
              key={checkTaxon.check_taxon_id}
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place={place}
              check_id={check_id}
              checkTaxon={checkTaxon}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
