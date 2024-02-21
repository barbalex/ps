import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { useElectric } from '../ElectricProvider'
import { createPlaceReportValue } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, place_id2, place_report_id } =
    useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results: placeReportValues = [] } = useLiveQuery(
    db.place_report_values.liveMany({
      where: { place_report_id, deleted: false },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const placeReportValue = createPlaceReportValue()
    await db.place_report_values.create({
      data: {
        ...placeReportValue,
        place_report_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/reports/${place_report_id}/values/${
        placeReportValue.place_report_value_id
      }`,
    )
  }, [
    db.place_report_values,
    navigate,
    place_id,
    place_id2,
    place_report_id,
    project_id,
    subproject_id,
  ])

  return (
    <div className="list-view">
      <ListViewHeader
        title="Place Report Values"
        addRow={add}
        tableName="place report value"
      />
      <div className="list-container">
        {placeReportValues.map(({ place_report_value_id, label }) => (
          <Row
            key={place_report_value_id}
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
              place_id2 ? `/places/${place_id2}` : ''
            }/reports/${place_report_id}/values/${place_report_value_id}`}
            label={label}
          />
        ))}
      </div>
    </div>
  )
}
