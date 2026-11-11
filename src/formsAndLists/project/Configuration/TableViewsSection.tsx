import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { Section } from '../../../components/shared/Section.tsx'
import { SectionDescription } from '../../../components/shared/SectionDescription.tsx'
import { Row } from '../../../components/shared/Row.tsx'
import { tableViewTables } from '../../../modules/tableViewTables.ts'

/**
 * Project configuration section for table views: one entry per table
 * views can be built on, linking to that table's views list.
 */
export const TableViewsSection = ({ projectId }: { projectId: string }) => {
  const { formatMessage } = useIntl()

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
    <Section
      title={formatMessage({
        id: '2kHq3x',
        defaultMessage: 'Ansichten',
      })}
    >
      <SectionDescription>
        {formatMessage({
          id: '6gV7wJ',
          defaultMessage:
            'Ansichten zeigen eine Tabelle auf zwei Weisen getrennt: nach Zeilen mit einem optionalen Filter und/oder nach Spalten mit einer optionalen Feldergruppe. Beispiel: Zwei Ansichten auf den Kontrollen: "Feld-Kontrollen" (Typ = Kontrolle) und "Freiwilligen-Kontrollen" (Typ = Freiwilligen-Kontrolle). Ein- und ausgeschaltet werden sie pro Ort-Stufe.',
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
