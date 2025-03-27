import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { FileNode } from './File.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import { useFilesNavData } from '../../modules/useFilesNavData.ts'
import { treeOpenNodesAtom } from '../../store.ts'

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
    const [openNodes] = useAtom(treeOpenNodesAtom)

    const location = useLocation()
    const navigate = useNavigate()

    const { navData, isLoading, isFiltered, countUnfiltered, countLoading } =
      useFilesNavData({
        projectId,
        subprojectId,
        placeId,
        placeId2,
        actionId,
        checkId,
      })

    const node = useMemo(
      () => ({
        label: `Files (${
          isFiltered ?
            `${isLoading ? '...' : formatNumber(navData.length)}/${
              countLoading ? '...' : formatNumber(countUnfiltered)
            }`
          : isLoading ? '...'
          : formatNumber(navData.length)
        })`,
      }),
      [isFiltered, isLoading, navData.length, countLoading, countUnfiltered],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => [
        'data',
        ...(projectId ? ['projects', projectId] : []),
        ...(subprojectId ? ['subprojects', subprojectId] : []),
        ...(placeId ? ['places', placeId] : []),
        ...(placeId2 ? ['places', placeId2] : []),
        ...(actionId ? ['actions', actionId] : []),
        ...(checkId ? ['checks', checkId] : []),
      ],
      [actionId, checkId, placeId, placeId2, projectId, subprojectId],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(() => [...parentArray, 'files'], [parentArray])
    const ownUrl = `/${ownArray.join('/')}`

    // TODO: needs to work not only works for urlPath, for all opened paths!
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

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
          node={node}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={navData.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          navData.map((file) => (
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
