import { useParams, useNavigate } from '@tanstack/react-router'

import { createPlaceActionReportQuantity } from '../modules/createRows.ts'
import { usePlaceActionReportQuantitiesNavData } from '../modules/usePlaceActionReportQuantitiesNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const PlaceActionReportQuantities = ({ from, hideTitle = false }) => {
  const { projectId, subprojectId, placeId, placeId2, placeActionReportId } =
    useParams({
      from,
    })
  const navigate = useNavigate()

  const { loading, navData } = usePlaceActionReportQuantitiesNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    placeActionReportId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createPlaceActionReportQuantity({ placeActionReportId })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({ ...prev, placeActionReportQuantityId: id }),
    })
  }

  return (
    <div className="list-view">
      {!hideTitle && (
        <ListHeader label={label} nameSingular={nameSingular} addRow={add} />
      )}
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          navs.map(({ id, label }) => (
            <Row key={id} label={label ?? id} to={id} />
          ))
        )}
      </div>
    </div>
  )
}
