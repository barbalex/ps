import { useParams, useNavigate } from '@tanstack/react-router'

import { AddProjectUserButton } from '../components/shared/AddProjectUserButton.tsx'
import { useSubprojectUsersNavData } from '../modules/useSubprojectUsersNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const SubprojectUsers = ({ hideHeader = false }) => {
  const { projectId, subprojectId } = useParams({ strict: false })
  const navigate = useNavigate()
  const usersBaseUrl = `/data/projects/${projectId}/subprojects/${subprojectId}/users`

  const { loading, navData, isFiltered } = useSubprojectUsersNavData({
    projectId,
    subprojectId,
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
                scope={{
                  kind: 'subproject',
                  projectId,
                  subprojectId,
                }}
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
