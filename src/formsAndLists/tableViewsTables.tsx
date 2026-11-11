import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { tableViewTables } from '../modules/tableViewTables.ts'
import { useTableViewsNavData } from '../modules/useTableViewsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

/**
 * The tables table views can be built on — the entry page of the
 * Ansichten config. Each table links to its views list.
 */
export const TableViewsTables = ({
  hideHeader = false,
  projectId: projectIdProp,
}: {
  hideHeader?: boolean
  projectId?: string
}) => {
  const { projectId: routeProjectId } = useParams({ strict: false })
  const projectId = projectIdProp ?? routeProjectId
  const { formatMessage } = useIntl()

  const { loading, navData } = useTableViewsNavData({ projectId: projectId! })
  const { label, nameSingular } = navData

  // view counts per table, shown next to the table label
  const res = useLiveQuery<{ table_name: string; count: number }>(
    `SELECT table_name, count(*)::int AS count FROM table_views
     WHERE project_id = $1
     GROUP BY table_name`,
    [projectId],
  )
  const counts = new Map(
    (res?.rows ?? []).map((row) => [row.table_name, row.count]),
  )

  const baseUrl = `/data/projects/${projectId}/table-views`

  return (
    <div className="list-view">
      {!hideHeader && (
        <ListHeader label={label} nameSingular={nameSingular} />
      )}
      <div className="list-container">
        {loading
          ? null
          : tableViewTables.map(({ tableName, label: tableLabel }) => (
              <Row
                key={tableName}
                label={`${formatMessage(tableLabel)} (${counts.get(tableName) ?? 0})`}
                to={`${baseUrl}/${tableName}`}
              />
            ))}
      </div>
    </div>
  )
}
