import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { Section } from '../../../components/shared/Section.tsx'
import { SectionDescription } from '../../../components/shared/SectionDescription.tsx'
import { Row } from '../../../components/shared/Row.tsx'
import { tableViewTables } from '../../../modules/tableViewTables.ts'

/**
 * Project configuration section for field groups: one entry per table
 * field groups can be built on, linking to that table's groups list.
 */
export const FieldGroupsSection = ({ projectId }: { projectId: string }) => {
  const { formatMessage } = useIntl()

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
    <Section
      title={formatMessage({
        id: 'zP3kM9',
        defaultMessage: 'Feldergruppen',
      })}
    >
      <SectionDescription>
        {formatMessage({
          id: 'aG2nH6',
          defaultMessage:
            'Feldergruppen bündeln Felder einer Tabelle. Eine Ansicht, die eine Feldergruppe verwendet, zeigt nur deren Spalten. Beispiel: "Biotop": die Biotop-Felder einer Kontrolle.',
        })}
      </SectionDescription>
      <div className="list-container">
        {tableViewTables.map(({ tableName, label: tableLabel }) => (
          <Row
            key={tableName}
            label={`${formatMessage(tableLabel)} (${counts.get(tableName) ?? 0})`}
            to={`${baseUrl}/${tableName}`}
          />
        ))}
      </div>
    </Section>
  )
}
