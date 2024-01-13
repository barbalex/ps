import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { SubprojectReports as SubprojectReport } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createSubprojectReport } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { subproject_id, project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db.subproject_reports.liveMany({
        where: { subproject_id, deleted: false },
      }),
    [subproject_id],
  )

  const add = useCallback(async () => {
    const data = await createSubprojectReport({
      db,
      project_id,
      subproject_id,
    })
    await db.subproject_reports.create({ data })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/reports/${data.subproject_report_id}`,
    )
  }, [db, navigate, project_id, subproject_id])

  const subprojectReports: SubprojectReport[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader
        title="Subproject Reports"
        addRow={add}
        tableName="subproject report"
      />
      <div className="list-container">
        {subprojectReports.map(({ subproject_report_id, label }) => (
          <Row
            key={subproject_report_id}
            to={`/projects/${project_id}/subprojects/${subproject_id}/reports/${subproject_report_id}`}
            label={label}
          />
        ))}
      </div>
    </div>
  )
}
