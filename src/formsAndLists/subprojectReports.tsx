import { useParams, useNavigate } from '@tanstack/react-router'

import { createSubprojectReport } from '../modules/createRows.ts'
import { useSubprojectReportsNavData } from '../modules/useSubprojectReportsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const SubprojectReports = ({ hideHeader = false }) => {
  const { projectId, subprojectId } = useParams({ strict: false })
  const navigate = useNavigate()

  const reportsBaseUrl = `/data/projects/${projectId}/subprojects/${subprojectId}/reports`

  const { loading, navData, isFiltered } = useSubprojectReportsNavData({
    projectId,
    subprojectId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createSubprojectReport({ projectId, subprojectId })
    if (!id) return
    navigate({ to: `${reportsBaseUrl}/${id}/` })
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
              to={`${reportsBaseUrl}/${id}/`}
              label={label ?? id}
            />
          ))
        }
      </div>
    </div>
  )
}
