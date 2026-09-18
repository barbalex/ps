import { useIntl } from 'react-intl'
import type { InputProps } from '@fluentui/react-components'

import { TextField } from '../../components/shared/TextField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { SqlEditorField } from '../../components/shared/SqlEditorField.tsx'
import { TextArea } from '../../components/shared/TextArea.tsx'
import { Section } from '../../components/shared/Section.tsx'
import { SectionDescription } from '../../components/shared/SectionDescription.tsx'
import type Exports from '../../models/public/Exports.ts'

import '../../form.css'

type InputOnChangeData = Parameters<NonNullable<InputProps['onChange']>>[1]

type Props = {
  onChange: (e: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => void
  validations?: Record<string, { state: 'error'; message: string }>
  row?: Exports
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
  from?: string
}

// this form is rendered from the item view and from the filter
export const ExportForm = ({ onChange, validations = {}, row, autoFocusRef }: Props) => {
  const { formatMessage } = useIntl()

  const paramHint = (() => {
    if (row?.level === 'root') {
      return formatMessage({
        id: 'export.sql.hintRoot',
        defaultMessage: '$1 = year (integer, optional)',
      })
    }
    if (row?.level === 'project') {
      return formatMessage({
        id: 'export.sql.hintProject',
        defaultMessage: '$1 = project_id (uuid), $2 = year (integer, optional)',
      })
    }
    if (row?.level === 'subproject') {
      return formatMessage({
        id: 'export.sql.hintSubproject',
        defaultMessage: '$1 = subproject_id (uuid), $2 = year (integer, optional)',
      })
    }
    return formatMessage({
      id: 'export.sql.hintNone',
      defaultMessage: 'Set level to see available parameters.',
    })
  })()

  return (
    <>
      <Section
        title={formatMessage({ id: 'export.section.name', defaultMessage: 'Name' })}
      >
        <SectionDescription>
          {formatMessage({
            id: 'export.section.name.description',
            defaultMessage:
              'Hier wird der Name für den Export in allen Sprachen definiert. Fehlt eine Sprache, wird Deutsch verwendet.',
          })}
        </SectionDescription>
        <TextField
          label={formatMessage({
            id: 'export.nameDe',
            defaultMessage: 'Deutsch',
          })}
          name="name_de"
          value={row?.name_de ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <TextField
          label={formatMessage({
            id: 'export.nameEn',
            defaultMessage: 'Englisch',
          })}
          name="name_en"
          value={row?.name_en ?? ''}
          onChange={onChange}
        />
        <TextField
          label={formatMessage({
            id: 'export.nameFr',
            defaultMessage: 'Französisch',
          })}
          name="name_fr"
          value={row?.name_fr ?? ''}
          onChange={onChange}
        />
        <TextField
          label={formatMessage({
            id: 'export.nameIt',
            defaultMessage: 'Italienisch',
          })}
          name="name_it"
          value={row?.name_it ?? ''}
          onChange={onChange}
        />
      </Section>
      <Section
        title={formatMessage({ id: 'export.section.variables', defaultMessage: 'Variabeln' })}
      >
        <SectionDescription>
          {formatMessage({
            id: 'export.section.variables.description',
            defaultMessage:
              'Diese Einstellung bestimmt, auf welcher Ebene der Export ausgeführt wird.',
          })}
        </SectionDescription>
        <RadioGroupField
          label={formatMessage({
            id: 'export.level',
            defaultMessage: 'Auf welcher Ebene wird exportiert?',
          })}
          name="level"
          list={['root', 'project', 'subproject']}
          value={row?.level ?? null}
          onChange={onChange}
          labelMap={{
            root: formatMessage({ id: 'export.level.root', defaultMessage: 'Root' }),
            project: formatMessage({ id: 'export.level.project', defaultMessage: 'Projekt' }),
            subproject: formatMessage({
              id: 'export.level.subproject',
              defaultMessage: 'Teilprojekt',
            }),
          }}
        />
      </Section>
      <Section
        title={formatMessage({ id: 'export.section.query', defaultMessage: 'Abfrage' })}
      >
        <SectionDescription>
          {formatMessage({
            id: 'export.section.query.description',
            defaultMessage:
              'Die Abfrage exportiert Daten. Sie retourniert beliebige Felder, die in der Exportdatei erscheinen.',
          })}
        </SectionDescription>
        <TextArea
          label={formatMessage({ id: 'export.description', defaultMessage: 'Beschreibung' })}
          name="description"
          value={row?.description ?? ''}
          onChange={onChange}
        />
        <SqlEditorField
          label={formatMessage({ id: 'export.sql', defaultMessage: 'SQL' })}
          name="sql"
          value={row?.sql ?? ''}
          onChange={
            onChange as (e: React.ChangeEvent<HTMLInputElement>) => void
          }
          hint={paramHint}
          validationMessage={validations?.sql?.message}
          validationState={validations?.sql?.state}
        />
        <TextField
          label={formatMessage({
            id: 'export.baseTable',
            defaultMessage: 'Basis-Tabelle',
          })}
          name="base_table"
          value={row?.base_table ?? ''}
          onChange={onChange}
          hint={formatMessage({
            id: 'export.baseTable.hint',
            defaultMessage:
              'Name der Haupt-Tabelle dieser Abfrage (z.B. projects, subprojects, places). Wird verwendet, um den aktuellen App-Filter anzuwenden.',
          })}
        />
      </Section>
    </>
  )
}
