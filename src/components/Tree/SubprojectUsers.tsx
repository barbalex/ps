import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { SubprojectUserNode } from './SubprojectUser.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

interface Props {
  project_id: string
  subproject_id: string
  level?: number
}

export const SubprojectUsersNode = memo(
  ({ project_id, subproject_id, level = 5 }: Props) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const result = useLiveIncrementalQuery(
      `SELECT * FROM subproject_users WHERE subproject_id = $1 order by label asc`,
      [subproject_id],
      'subproject_user_id',
    )
    const subprojectUsers = result?.rows ?? []

    const subprojectUsersNode = useMemo(
      () => ({ label: `Users (${subprojectUsers.length})` }),
      [subprojectUsers.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => ['data', 'projects', project_id, 'subprojects', subproject_id],
      [project_id, subproject_id],
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
          navigate({
            pathname: parentUrl,
            search: searchParams.toString(),
          })
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
      searchParams,
      urlPath.length,
    ])

    return (
      <>
        <Node
          node={subprojectUsersNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={subprojectUsers.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          subprojectUsers.map((subprojectUser) => (
            <SubprojectUserNode
              key={subprojectUser.subproject_user_id}
              project_id={project_id}
              subproject_id={subproject_id}
              subprojectUser={subprojectUser}
            />
          ))}
      </>
    )
  },
)
