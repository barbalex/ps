import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { ProjectUserNode } from './ProjectUser.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id: string
  level?: number
}

export const ProjectUsersNode = memo(({ project_id, level = 3 }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: projectUsers = [] } = useLiveQuery(
    db.project_users.liveMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    }),
  )
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  const projectUsersNode = useMemo(
    () => ({ label: `Users (${projectUsers.length})` }),
    [projectUsers.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[1] === 'projects' &&
    urlPath[2] === project_id &&
    urlPath[3] === 'users'
  const isActive = isOpen && urlPath.length === level + 1

  const baseArray = useMemo(
    () => ['data', 'projects', project_id],
    [project_id],
  )
  const baseUrl = baseArray.join('/')

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: [...baseArray, 'users'],
        db,
        appStateId: appState?.app_state_id,
      })
      return navigate({ pathname: baseUrl, search: searchParams.toString() })
    }
    navigate({ pathname: `${baseUrl}/users`, search: searchParams.toString() })
  }, [
    appState?.app_state_id,
    baseArray,
    baseUrl,
    db,
    isOpen,
    navigate,
    searchParams,
  ])

  return (
    <>
      <Node
        node={projectUsersNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={projectUsers.length}
        to={`${baseUrl}/users`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        projectUsers.map((projectUser) => (
          <ProjectUserNode
            key={projectUser.project_user_id}
            project_id={project_id}
            projectUser={projectUser}
          />
        ))}
    </>
  )
})
