import { useParams, useNavigate } from '@tanstack/react-router'

import { AddProjectUserButton } from '../components/shared/AddProjectUserButton.tsx'
import { useProjectUsersNavData } from '../modules/useProjectUsersNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const ProjectUsers = ({ hideHeader = false }) => {
  const { projectId } = useParams({ strict: false })
  const navigate = useNavigate()
  const usersBaseUrl = `/data/projects/${projectId}/users`

  const { loading, navData, isFiltered } = useProjectUsersNavData({
    projectId,
  })
  const { navs, label, nameSingular } = navData

  const onUserCreated = (id: string) => {
    navigate({ to: `${usersBaseUrl}/${id}/` })
  }

  return (
    <div className="list-view">
      {!hideHeader && (
        <ListHeader
          label={label}
          nameSingular={nameSingular}
          menus={
            <>
              <AddProjectUserButton
                scope={{ kind: 'project', projectId }}
                onUserCreated={onUserCreated}
              />
              <FilterButton isFiltered={isFiltered} />
            </>
          }
        />
      )}
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          navs.map(({ id, label }) => (
            <Row key={id} to={`${usersBaseUrl}/${id}/`} label={label ?? id} />
          ))
        )}
      </div>
    </div>
  )
}
