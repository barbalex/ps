import { useParams, useNavigate } from '@tanstack/react-router'

import { createActionReportValue } from '../modules/createRows.ts'
import { useActionReportValuesNavData } from '../modules/useActionReportValuesNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const ActionReportValues = ({ from }) => {
  const {
    projectId,
    subprojectId,
    placeId,
    placeId2,
    actionId,
    actionReportId,
  } = useParams({ from })
  const navigate = useNavigate()

  const { loading, navData } = useActionReportValuesNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    actionId,
    actionReportId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createActionReportValue({ actionReportId })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({
        ...prev,
        actionReportValueId: id,
      }),
    })
  }

  return (
    <div className="list-view">
      <ListHeader label={label} nameSingular={nameSingular} addRow={add} />
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          <>
            {navs.map(({ id, label }) => (
              <Row key={id} label={label ?? id} navigateTo={id} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
