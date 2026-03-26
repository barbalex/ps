import { useParams, useNavigate } from '@tanstack/react-router'

import { createCheckQuantity } from '../modules/createRows.ts'
import { useCheckQuantitiesNavData } from '../modules/useCheckQuantitiesNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const CheckQuantities = ({ from, hideTitle = false }) => {
  const { projectId, subprojectId, placeId, placeId2, checkId } = useParams({
    from,
  })
  const navigate = useNavigate()

  const { loading, navData } = useCheckQuantitiesNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    checkId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createCheckQuantity({ checkId })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({ ...prev, checkQuantityId: id }),
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
