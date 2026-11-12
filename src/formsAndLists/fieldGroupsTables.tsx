import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { tableViewTables } from '../modules/tableViewTables.ts'
import { useFieldGroupsNavData } from '../modules/useFieldGroupsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

/**
 * The tables field groups can be built on — the entry page of the
 * Feldergruppen config. Each table links to its groups list.
 */
export const FieldGroupsTables = ({
  hideHeader = false,
  projectId: projectIdProp,
}: {
  hideHeader?: boolean
  projectId?: string
}) => {
  const { projectId: routeProjectId } = useParams({ strict: false })
  const projectId = projectIdProp ?? routeProjectId
  const { formatMessage } = useIntl()

  const { loading, navData } = useFieldGroupsNavData({ projectId: projectId! })
  const { label, nameSingular } = navData

  const res = useLiveQuery<{ table_name: string; count: number }>(
    `SELECT table_name, count(*)::int AS count FROM field_groups
     WHERE project_id = $1
     GROUP BY table_name`,
    [projectId],
  )
  const counts = new Map(
    (res?.rows ?? []).map((row) => [row.table_name, row.count]),
  )

  const baseUrl = `/data/projects/${projectId}/field-groups`

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
