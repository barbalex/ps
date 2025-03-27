import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { CrsNode } from './Crs.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useCrssNavData } from '../../modules/useCrssNavData.ts'

export const CrssNode = memo(() => {
  const navigate = useNavigate()

  const { navData } = useCrssNavData()

  const onClickButton = useCallback(() => {
    if (navData.isOpen) {
      removeChildNodes({ node: navData.ownArray })
      // only navigate if urlPath includes ownArray
      if (
        navData.isInActiveNodeArray &&
        navData.ownArray.length <= navData.urlPath.length
      ) {
        navigate({ to: navData.parentUrl })
      }
      return
    }
    // add to openNodes without navigating
    addOpenNodes({ nodes: [navData.ownArray] })
  }, [
    navData.isInActiveNodeArray,
    navData.isOpen,
    navData.ownArray,
    navData.parentUrl,
    navData.urlPath.length,
    navigate,
  ])

  return (
    <>
      <Node
        node={{ label: navData.label }}
        level={navData.level}
        isOpen={navData.isOpen}
        isInActiveNodeArray={navData.isInActiveNodeArray}
        isActive={navData.isActive}
        childrenCount={navData.navs.length}
        to={navData.ownUrl}
        onClickButton={onClickButton}
      />
      {navData.isOpen &&
        navData.navs.map((cr) => (
          <CrsNode
            key={cr.crs_id}
            crs={cr}
          />
        ))}
    </>
  )
})
