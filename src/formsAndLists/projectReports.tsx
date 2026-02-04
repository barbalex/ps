import { useParams, useNavigate } from '@tanstack/react-router'

import { createProjectReport } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useProjectReportsNavData } from '../modules/useProjectReportsNavData.ts'
import '../form.css'

const from = '/data/projects/$projectId_/reports/'

export const ProjectReports = () => {
  const { projectId } = useParams({ from })
  const navigate = useNavigate()

  const { loading, navData, isFiltered } = useProjectReportsNavData({
    projectId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createProjectReport({ projectId })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({ ...prev, projectReportId: id }),
    })
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
