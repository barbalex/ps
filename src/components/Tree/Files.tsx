import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { FileNode } from './File.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useFilesNavData } from '../../modules/useFilesNavData.ts'

interface Props {
  projectId?: string
  subprojectId?: string
  placeId?: string
  placeId2?: string
  checkId?: string
  actionId?: string
  level: number
}

export const FilesNode = memo(
  ({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    checkId,
    actionId,
    level,
  }: Props) => {
    const navigate = useNavigate()

    const { navData } = useFilesNavData({
      projectId,
      subprojectId,
      placeId,
      placeId2,
      actionId,
      checkId,
    })
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
          node={{ label }}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={navs.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          navs.map((file) => (
            <FileNode
              key={file.file_id}
              projectId={projectId}
              subprojectId={subprojectId}
              placeId={placeId}
              placeId2={placeId2}
              actionId={actionId}
              checkId={checkId}
              file={file}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
