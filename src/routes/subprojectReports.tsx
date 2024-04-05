import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider'
import { createSubprojectReport } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { subproject_id, project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: subprojectReports = [] } = useLiveQuery(
    db.subproject_reports.liveMany({
      where: { subproject_id },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const data = await createSubprojectReport({
      db,
      project_id,
      subproject_id,
    })
    await db.subproject_reports.create({ data })
    navigate({
      pathname: data.subproject_report_id,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_id, searchParams, subproject_id])

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
            to={subproject_report_id}
            label={label}
          />
        ))}
      </div>
    </div>
  )
}
