import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { SubprojectReports as SubprojectReport } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createSubprojectReport } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
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
      {subprojectReports.map(
        (subprojectReport: SubprojectReport, index: number) => (
          <p key={index} className="item">
            <Link
              to={`/projects/${project_id}/subprojects/${subproject_id}/reports/${subprojectReport.subproject_report_id}`}
            >
              {subprojectReport.label ?? subprojectReport.subproject_report_id}
            </Link>
          </p>
        ),
      )}
    </div>
  )
}
