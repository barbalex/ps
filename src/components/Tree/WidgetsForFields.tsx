import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { WidgetForFieldNode } from './WidgetForField.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useWidgetsForFieldsNavData } from '../../modules/useWidgetsForFieldsNavData.ts'

// mirrors the open rows returned by useWidgetsForFieldsNavData's sql
type NavData = {
  id: string
  label: string
  count_unfiltered: number
  count_filtered: number
}

export const WidgetsForFieldsNode = () => {
  const navigate = useNavigate()

  const { navData } = useWidgetsForFieldsNavData()
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

  const onClickButton = () => {
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
  }

  // only list navs if isOpen AND the first nav has an id
  const openNavs = navs as NavData[]
  const showNavs = isOpen && navs.length > 0 && openNavs[0].id

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
        openNavs.map((nav, i) => (
          <WidgetForFieldNode
            key={`${nav.id}-${i}`}
            nav={nav}
          />
        ))}
    </>
  )
}
