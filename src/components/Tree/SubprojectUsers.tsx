import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { SubprojectUserNode } from './SubprojectUser.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import { treeOpenNodesAtom } from '../../store.ts'

interface Props {
  projectId: string
  subprojectId: string
  level?: number
}

export const SubprojectUsersNode = memo(
  ({ projectId, subprojectId, level = 5 }: Props) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const location = useLocation()
    const navigate = useNavigate()

    const res = useLiveIncrementalQuery(
      `
      SELECT
        subproject_user_id,
        label
      FROM subproject_users 
      WHERE subproject_id = $1 
      ORDER BY label`,
      [subprojectId],
      'subproject_user_id',
    )
    const rows = res?.rows ?? []
    const loading = res === undefined

    const node = useMemo(
      () => ({
        label: `Users (${loading ? '...' : formatNumber(rows.length)})`,
      }),
      [loading, rows.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => ['data', 'projects', projectId, 'subprojects', subprojectId],
      [projectId, subprojectId],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(() => [...parentArray, 'users'], [parentArray])
    const ownUrl = `/${ownArray.join('/')}`

    // needs to work not only works for urlPath, for all opened paths!
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
          childrenCount={rows.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          rows.map((subprojectUser) => (
            <SubprojectUserNode
              key={subprojectUser.subproject_user_id}
              projectId={projectId}
              subprojectId={subprojectId}
              subprojectUser={subprojectUser}
            />
          ))}
      </>
    )
  },
)
