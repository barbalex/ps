import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createPlaceReportValue } from '../modules/createRows.ts'
import { usePlaceReportValuesNavData } from '../modules/usePlaceReportValuesNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const PlaceReportValues = ({ from }) => {
  const { projectId, subprojectId, placeId, placeId2, placeReportId } =
    useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData } = usePlaceReportValuesNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    placeReportId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const res = await createPlaceReportValue({ placeReportId, db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.place_report_value_id,
      params: (prev) => ({
        ...prev,
        placeReportValueId: data.place_report_value_id,
      }),
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
        : <>
            {navs.map(({ id, label }) => (
              <Row
                key={id}
                to={id}
                label={label ?? id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
}
