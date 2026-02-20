import { useParams, useNavigate } from '@tanstack/react-router'

import { createSubprojectUser } from '../modules/createRows.ts'
import { useSubprojectUsersNavData } from '../modules/useSubprojectUsersNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from = '/data/projects/$projectId_/subprojects/$subprojectId_/users/'

export const SubprojectUsers = () => {
  const { projectId, subprojectId } = useParams({ from })
  const navigate = useNavigate()

  const { loading, navData, isFiltered } = useSubprojectUsersNavData({
    projectId,
    subprojectId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createSubprojectUser({ subprojectId })
    if (!id) return
    navigate({ to: id })
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          navs.map(({ id, label }) => (
            <Row key={id} to={id} label={label ?? id} />
          ))
        )}
      </div>
    </div>
  )
}
