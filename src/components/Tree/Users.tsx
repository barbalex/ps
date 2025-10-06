import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { UserNode } from './User.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useUsersNavData } from '../../modules/useUsersNavData.ts'

export const UsersNode = memo(() => {
  const navigate = useNavigate()

  const { navData } = useUsersNavData()
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
      removeChildNodes({
        node: ownArray,
        isRoot: true,
      })
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
          <UserNode
            key={`${nav.id}-${i}`}
            nav={nav}
          />
        ))}
    </>
  )
})
