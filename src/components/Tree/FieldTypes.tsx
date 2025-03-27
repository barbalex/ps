import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { FieldTypeNode } from './FieldType.tsx'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { useFieldTypesNavData } from '../../modules/useFieldTypesNavData.ts'
export const FieldTypesNode = memo(() => {
  const navigate = useNavigate()

  const { navData } = useFieldTypesNavData()

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
        navData.navs.map((fieldType) => (
          <FieldTypeNode
            key={fieldType.field_type_id}
            fieldType={fieldType}
          />
        ))}
    </>
  )
})
