import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createPlaceReport } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { usePlaceReportsNavData } from '../modules/usePlaceReportsNavData.ts'
import '../form.css'

export const PlaceReports = ({ from }) => {
  const { projectId, subprojectId, placeId, placeId2 } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData, isFiltered } = usePlaceReportsNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const res = await createPlaceReport({
      db,
      projectId,
      placeId: placeId2 ?? placeId,
    })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.place_report_id,
      params: (prev) => ({ ...prev, placeReportId: data.place_report_id }),
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
