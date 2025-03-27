import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { FieldNode } from './Field.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useFieldsNavData } from '../../modules/useFieldsNavData.ts'

interface Props {
  projectId?: string
}

export const FieldsNode = memo(({ projectId }: Props) => {
  const navigate = useNavigate()

  const { navData } = useFieldsNavData({ projectId })

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
        level={projectId ? 3 : 1}
        isOpen={navData.isOpen}
        isInActiveNodeArray={navData.isInActiveNodeArray}
        isActive={navData.isActive}
        childrenCount={navData.navs.length}
        to={navData.ownUrl}
        onClickButton={onClickButton}
      />
      {navData.isOpen &&
        navData.navs.map((field) => (
          <FieldNode
            key={field.field_id}
            field={field}
            projectId={projectId}
          />
        ))}
    </>
  )
})
