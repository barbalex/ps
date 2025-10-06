import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { AccountNode } from './Account.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useAccountsNavData } from '../../modules/useAccountsNavData.ts'

export const AccountsNode = memo(() => {
  const navigate = useNavigate()

  const { navData } = useAccountsNavData()
  const {
    label,
    parentUrl,
    ownArray,
    ownUrl,
    urlPath,
    level,
    isOpen,
    isInActiveNodeArray,
    isActive,
    navs,
  } = navData

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({ node: ownArray, isRoot: true })
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
    ownArray,
    parentUrl,
    urlPath.length,
    navigate,
  ])

  // only list navs if isOpen AND the first nav has an id
  const showNavs = isOpen && navs.length > 0 && navs[0].id

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
      {showNavs &&
        navs.map((nav, i) => (
          <AccountNode
            key={`${nav.id}-${i}`}
            nav={nav}
          />
        ))}
    </>
  )
})
