import { useParams, useNavigate } from '@tanstack/react-router'

import { createPlaceActionReport } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { usePlaceActionReportsNavData } from '../modules/usePlaceActionReportsNavData.ts'
import '../form.css'

export const PlaceActionReports = ({ from }) => {
  const { projectId, subprojectId, placeId, placeId2 } = useParams({ from })
  const navigate = useNavigate()

  const { loading, navData, isFiltered } = usePlaceActionReportsNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createPlaceActionReport({
      projectId,
      placeId: placeId2 ?? placeId,
    })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({ ...prev, placeActionReportId: id }),
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
