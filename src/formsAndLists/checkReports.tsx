import { useParams, useNavigate } from '@tanstack/react-router'

import { createCheckReport } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useCheckReportsNavData } from '../modules/useCheckReportsNavData.ts'
import '../form.css'

export const CheckReports = ({ from }) => {
  const { projectId, subprojectId, placeId, placeId2 } = useParams({ from })
  const navigate = useNavigate()

  const { loading, navData, isFiltered } = useCheckReportsNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createCheckReport({
      projectId,
      placeId: placeId2 ?? placeId,
    })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({ ...prev, checkReportId: id }),
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
