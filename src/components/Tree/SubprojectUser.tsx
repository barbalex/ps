import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { Node } from './Node.tsx'
import { SubprojectUsers as SubprojectUser } from '../../../generated/client/index.ts'

interface Props {
  project_id: string
  subproject_id: string
  subprojectUser: SubprojectUser
  level?: number
}

export const SubprojectUserNode = memo(
  ({ project_id, subproject_id, subprojectUser, level = 6 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'subprojects' &&
      urlPath[4] === subproject_id &&
      urlPath[5] === 'users' &&
      urlPath[6] === subprojectUser.subproject_user_id
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/data/projects/${project_id}/subprojects/${subproject_id}/users`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${subprojectUser.subproject_user_id}`,
        search: searchParams.toString(),
      })
    }, [
      isOpen,
      navigate,
      baseUrl,
      subprojectUser.subproject_user_id,
      searchParams,
    ])

    return (
      <Node
        node={subprojectUser}
        id={subprojectUser.subproject_user_id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${subprojectUser.subproject_user_id}`}
        onClickButton={onClickButton}
      />
    )
  },
)
