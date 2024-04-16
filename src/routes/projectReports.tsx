import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider'
import { createProjectReport } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: projectReports = [] } = useLiveQuery(
    db.project_reports.liveMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const data = await createProjectReport({ db, project_id })
    await db.project_reports.create({ data })
    navigate({
      pathname: data.project_report_id,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title="Project Reports"
        addRow={add}
        tableName="project report"
      />
      <div className="list-container">
        {projectReports.map(({ project_report_id, label }) => (
          <Row
            key={project_report_id}
            to={project_report_id}
            label={label ?? project_report_id}
          />
        ))}
      </div>
    </div>
  )
}
