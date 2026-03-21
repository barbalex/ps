import { useParams, useNavigate } from '@tanstack/react-router'

import { createCheckReport } from '../modules/createRows.ts'
import { useCheckReportsNavData } from '../modules/useCheckReportsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const CheckReports = ({ from }) => {
  const { projectId, subprojectId, placeId, placeId2, checkId } = useParams({
    from,
  })
  const navigate = useNavigate()

  const { loading, navData } = useCheckReportsNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    checkId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createCheckReport({ projectId, checkId })
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
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : navs.map(({ id, label }) => (
            <Row
              key={id}
              label={label}
              to={id}
            />
          ))
        }
      </div>
    </div>
  )
}
