import { useCallback, useMemo, memo } from 'react'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'

import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import { Node } from './Node.tsx'
import { TaxonNode } from './Taxon.tsx'
import { treeOpenNodesAtom } from '../../store.ts'

interface Props {
  projectId: string
  taxonomy_id: string
  level?: number
}

export const TaxaNode = memo(({ projectId, taxonomyId, level = 5 }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const navigate = useNavigate()

  const res = useLiveIncrementalQuery(
    `
      SELECT
        taxon_id,
        label
      FROM taxa 
      WHERE taxonomy_id = $1 
      ORDER BY label`,
    [taxonomyId],
    'taxon_id',
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
    () => ['data', 'projects', projectId, 'taxonomies', taxonomyId],
    [projectId, taxonomyId],
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
        rows.map((taxon) => (
          <TaxonNode
            key={taxon.taxon_id}
            projectId={projectId}
            taxonomyId={taxonomyId}
            taxon={taxon}
          />
        ))}
    </>
  )
})
