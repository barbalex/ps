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
import { useTaxaNavData } from '../../modules/useTaxaNavData.ts'

interface Props {
  projectId: string
  taxonomy_id: string
  level?: number
}

export const TaxaNode = memo(({ projectId, taxonomyId, level = 5 }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const navigate = useNavigate()

  const { navData } = useTaxaNavData({ projectId, taxonomyId })
  const {
    label,
    parentUrl,
    ownArray,
    ownUrl,
    urlPath,
    isOpen,
    isInActiveNodeArray,
    isActive,
    navs,
  } = navData

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
        label={label}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={navs.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        navs.map((nav) => (
          <TaxonNode
            key={nav.id}
            projectId={projectId}
            taxonomyId={taxonomyId}
            nav={nav}
          />
        ))}
    </>
  )
})
