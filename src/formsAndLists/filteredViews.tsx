import { useParams, useNavigate } from '@tanstack/react-router'

import { createFilteredView } from '../modules/createRows.ts'
import { useFilteredViewsNavData } from '../modules/useFilteredViewsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const FilteredViews = ({
  hideHeader = false,
  projectId: projectIdProp,
}: {
  hideHeader?: boolean
  projectId?: string
}) => {
  const { projectId: routeProjectId } = useParams({ strict: false })
  const projectId = projectIdProp ?? routeProjectId
  const navigate = useNavigate()
  const baseUrl = `/data/projects/${projectId}/filtered-views`

  const { loading, navData, isFiltered } = useFilteredViewsNavData({
    projectId: projectId!,
  })
  const { label, nameSingular } = navData
  const navs = navData.navs as { id: string; label: string }[]

  const add = async () => {
    const id = await createFilteredView({ projectId: projectId! })
    if (!id) return
    navigate({ to: `${baseUrl}/${id}/` })
  }

  return (
    <div className="list-view">
      {!hideHeader && (
        <ListHeader
          label={label}
          nameSingular={nameSingular}
          addRow={add}
          menus={<FilterButton isFiltered={isFiltered} />}
        />
      )}
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          navs.map(({ id, label }) => (
            <Row key={id} label={label ?? id} to={`${baseUrl}/${id}/`} />
          ))
        )}
      </div>
    </div>
  )
}
