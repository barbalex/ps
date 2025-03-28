import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { ListValueNode } from './ListValue.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useListValuesNavData } from '../../modules/useListValuesNavData.ts'

interface Props {
  projectId: string
  listId: string
  level?: number
}

export const ListValuesNode = memo(
  ({ projectId, listId, level = 5 }: Props) => {
    const navigate = useNavigate()

    const { navData } = useListValuesNavData({ projectId, listId })
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
          navs.map((listValue) => (
            <ListValueNode
              key={listValue.list_value_id}
              projectId={projectId}
              listId={listId}
              listValue={listValue}
            />
          ))}
      </>
    )
  },
)
