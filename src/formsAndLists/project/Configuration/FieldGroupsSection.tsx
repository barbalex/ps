import { useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { Section } from '../../../components/shared/Section.tsx'
import { SectionDescription } from '../../../components/shared/SectionDescription.tsx'
import { Row } from '../../../components/shared/Row.tsx'
import { FormMenu } from '../../../components/FormMenu/index.tsx'
import { createFieldGroup } from '../../../modules/createRows.ts'

/**
 * Project configuration section for field groups: named subsets of a
 * table's fields (e.g. "Biotop": the biotope fields of a check). Table
 * views use them to show only a subset of the columns.
 */
export const FieldGroupsSection = ({ projectId }: { projectId: string }) => {
  const navigate = useNavigate()
  const { formatMessage } = useIntl()

  const res = useLiveQuery(
    `SELECT field_group_id AS id, label, table_name FROM field_groups WHERE project_id = $1 ORDER BY label`,
    [projectId],
  )
  const navs = (res?.rows ?? []) as {
    id: string
    label: string
    table_name: string | null
  }[]

  const baseUrl = `/data/projects/${projectId}/field-groups`

  const add = async () => {
    const id = await createFieldGroup({ projectId })
    if (!id) return
    navigate({ to: `${baseUrl}/${id}/` })
  }

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
      <div className="list-view-header">
        <FormMenu
          addRow={add}
          nameSingular={formatMessage({
            id: 'vN8wL2',
            defaultMessage: 'Feldergruppe',
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
