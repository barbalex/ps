import { useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { Section } from '../../../components/shared/Section.tsx'
import { SectionDescription } from '../../../components/shared/SectionDescription.tsx'
import { Row } from '../../../components/shared/Row.tsx'
import { FormMenu } from '../../../components/FormMenu/index.tsx'
import { createTableView } from '../../../modules/createRows.ts'

/**
 * Project configuration section for table views (e.g. Feld-Kontrollen and
 * Freiwilligen-Kontrollen as two views on checks). Links to the view forms.
 */
export const TableViewsSection = ({ projectId }: { projectId: string }) => {
  const navigate = useNavigate()
  const { formatMessage } = useIntl()

  const res = useLiveQuery(
    `SELECT table_view_id AS id, label, table_name FROM table_views WHERE project_id = $1 ORDER BY sort, label`,
    [projectId],
  )
  const navs = (res?.rows ?? []) as {
    id: string
    label: string
    table_name: string | null
  }[]

  const baseUrl = `/data/projects/${projectId}/table-views`

  const add = async () => {
    const id = await createTableView({ projectId })
    if (!id) return
    navigate({ to: `${baseUrl}/${id}/` })
  }

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
      <div className="list-view-header">
        <FormMenu
          addRow={add}
          nameSingular={formatMessage({
            id: '5mN8vP',
            defaultMessage: 'Ansicht',
          })}
        />
      </div>
      <div className="list-container">
        {navs.map(({ id, label }) => (
          <Row key={id} label={label ?? id} to={`${baseUrl}/${id}/`} />
        ))}
      </div>
    </Section>
  )
}
