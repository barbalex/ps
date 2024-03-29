import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider'
import { createActionReport } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id, action_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: actionReports = [] } = useLiveQuery(
    db.action_reports.liveMany({
      where: { action_id, deleted: false },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const data = await createActionReport({
      db,
      project_id,
      action_id,
    })
    await db.action_reports.create({ data })
    navigate({
      pathname: data.action_report_id,
      search: searchParams.toString(),
    })
  }, [action_id, db, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title="Action Reports"
        addRow={add}
        tableName="action report"
      />
      <div className="list-container">
        {actionReports.map(({ action_report_id, label }) => (
          <Row key={action_report_id} label={label} to={action_report_id} />
        ))}
      </div>
    </div>
  )
}
