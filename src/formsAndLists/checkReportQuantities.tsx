import { useParams, useNavigate } from '@tanstack/react-router'

import { createCheckReportQuantity } from '../modules/createRows.ts'
import { useCheckReportQuantitiesNavData } from '../modules/useCheckReportQuantitiesNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const CheckReportQuantities = ({ from, hideTitle = false }) => {
  const { projectId, subprojectId, placeId, placeId2, checkReportId } =
    useParams({
      from,
    })
  const navigate = useNavigate()

  const { loading, navData } = useCheckReportQuantitiesNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    checkReportId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createCheckReportQuantity({ checkReportId })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({ ...prev, checkReportQuantityId: id }),
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
