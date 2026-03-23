import { useParams, useNavigate } from '@tanstack/react-router'

import { createPlaceReportQuantity } from '../modules/createRows.ts'
import { usePlaceReportQuantitiesNavData } from '../modules/usePlaceReportQuantitiesNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const PlaceReportQuantities = ({ from }) => {
  const { projectId, subprojectId, placeId, placeId2, placeReportId } =
    useParams({
      from,
    })
  const navigate = useNavigate()

  const { loading, navData } = usePlaceReportQuantitiesNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    placeReportId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createPlaceReportQuantity({ placeReportId })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({ ...prev, placeReportQuantityId: id }),
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
