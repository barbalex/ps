import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { WidgetForFieldNode } from './WidgetForField.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import { useWidgetsForFieldsNavData } from '../../modules/useWidgetsForFieldsNavData.ts'
import { treeOpenNodesAtom } from '../../store.ts'

export const WidgetsForFieldsNode = memo(() => {
  const navigate = useNavigate()

  const { navData } = useWidgetsForFieldsNavData()

  const onClickButton = useCallback(() => {
    if (navData.isOpen) {
      removeChildNodes({
        node: navData.ownArray,
        isRoot: true,
      })
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
        navData.navs.map((widgetForField) => (
          <WidgetForFieldNode
            key={widgetForField.widget_for_field_id}
            widgetForField={widgetForField}
          />
        ))}
    </>
  )
})
