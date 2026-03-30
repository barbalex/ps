import { useParams, useNavigate } from '@tanstack/react-router'

import { createActionReportQuantity } from '../modules/createRows.ts'
import { useActionReportQuantitiesNavData } from '../modules/useActionReportQuantitiesNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const ActionReportQuantities = ({ from, hideTitle = false }) => {
  const { projectId, subprojectId, placeId, placeId2, actionReportId } =
    useParams({
      from,
    })
  const navigate = useNavigate()

  const { loading, navData } = useActionReportQuantitiesNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    placeActionReportId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createActionReportQuantity({ placeActionReportId })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({ ...prev, actionReportQuantityId: id }),
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
