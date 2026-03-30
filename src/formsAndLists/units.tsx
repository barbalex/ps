import { useParams, useNavigate } from '@tanstack/react-router'

import { createUnit } from '../modules/createRows.ts'
import { useUnitsNavData } from '../modules/useUnitsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const Units = ({ hideHeader = false, projectId: projectIdProp }) => {
  const { projectId: routeProjectId } = useParams({ strict: false })
  const projectId = projectIdProp ?? routeProjectId
  const navigate = useNavigate()
  const unitsBaseUrl = `/data/projects/${projectId}/units`

  const { loading, navData, isFiltered } = useUnitsNavData({ projectId })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createUnit({ projectId })
    if (!id) return
    navigate({ to: `${unitsBaseUrl}/${id}/` })
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
        {loading ?
          <Loading />
        : navs.map(({ id, label }) => (
            <Row
              key={id}
              label={label ?? id}
              to={`${unitsBaseUrl}/${id}/`}
            />
          ))
        }
      </div>
    </div>
  )
}
