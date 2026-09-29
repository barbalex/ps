import { useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { Section } from '../../../components/shared/Section.tsx'
import { SectionDescription } from '../../../components/shared/SectionDescription.tsx'
import { Row } from '../../../components/shared/Row.tsx'
import { FormMenu } from '../../../components/FormMenu/index.tsx'
import { createFilteredView } from '../../../modules/createRows.ts'

/**
 * Project configuration section for filtered views (e.g. Feld-Kontrollen and
 * Freiwilligen-Kontrollen as two views on checks). Links to the view forms.
 */
export const FilteredViewsSection = ({ projectId }: { projectId: string }) => {
  const navigate = useNavigate()
  const { formatMessage } = useIntl()

  const res = useLiveQuery(
    `SELECT filtered_view_id AS id, label, table_name FROM filtered_views WHERE project_id = $1 ORDER BY sort, label`,
    [projectId],
  )
  const navs = (res?.rows ?? []) as {
    id: string
    label: string
    table_name: string | null
  }[]

  const baseUrl = `/data/projects/${projectId}/filtered-views`

  const add = async () => {
    const id = await createFilteredView({ projectId })
    if (!id) return
    navigate({ to: `${baseUrl}/${id}/` })
  }

  return (
    <Section
      title={formatMessage({
        id: '2kHq3x',
        defaultMessage: 'Gefilterte Ansichten',
      })}
    >
      <SectionDescription>
        {formatMessage({
          id: '6gV7wJ',
          defaultMessage:
            'Gefilterte Ansichten zeigen nur Tabellen-Zeilen, die einem Filter entsprechen. Beispiel: Zwei Ansichten auf den Kontrollen: "Feld-Kontrollen" (Typ = Kontrolle) und "Freiwilligen-Kontrollen" (Typ = Freiwilligen-Kontrolle). Ein- und ausgeschaltet werden sie pro Ort-Stufe.',
        })}
      </SectionDescription>
      <div className="list-view-header">
        <FormMenu
          addRow={add}
          nameSingular={formatMessage({
            id: '5mN8vP',
            defaultMessage: 'Gefilterte Ansicht',
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
