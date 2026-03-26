import { useParams, useNavigate } from '@tanstack/react-router'

import { createPlaceCheckReportQuantity } from '../modules/createRows.ts'
import { usePlaceCheckReportQuantitiesNavData } from '../modules/usePlaceCheckReportQuantitiesNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const PlaceCheckReportQuantities = ({ from }) => {
  const { projectId, subprojectId, placeId, placeId2, placeCheckReportId } =
    useParams({
      from,
    })
  const navigate = useNavigate()

  const { loading, navData } = usePlaceCheckReportQuantitiesNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    placeCheckReportId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createPlaceCheckReportQuantity({ placeCheckReportId })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({ ...prev, placeCheckReportQuantityId: id }),
    })
  }

  return (
    <div className="list-view">
      <ListHeader label={label} nameSingular={nameSingular} addRow={add} />
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
