import { useParams, useNavigate } from '@tanstack/react-router'

import { createSubprojectReport } from '../modules/createRows.ts'
import { useSubprojectReportsNavData } from '../modules/useSubprojectReportsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const SubprojectReports = ({ from }) => {
  const { projectId, subprojectId } = useParams({ from })
  const navigate = useNavigate()

  const { loading, navData, isFiltered } = useSubprojectReportsNavData({
    projectId,
    subprojectId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createSubprojectReport({ projectId, subprojectId })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({
        ...prev,
        subprojectReportId: id,
      }),
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
        {loading ?
          <Loading />
        : navs.map(({ id, label }) => (
            <Row
              key={id}
              to={id}
              label={label ?? id}
            />
          ))
        }
      </div>
    </div>
  )
}
