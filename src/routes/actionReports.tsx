import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider.tsx'
import { createActionReport } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  const { project_id, action_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: actionReports = [] } = useLiveQuery(
    db.action_reports.liveMany({
      where: { action_id },
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
          <Row
            key={action_report_id}
            label={label ?? account_report_id}
            to={action_report_id}
          />
        ))}
      </div>
    </div>
  )
})
