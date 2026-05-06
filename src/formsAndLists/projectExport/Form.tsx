import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { SqlEditorField } from '../../components/shared/SqlEditorField.tsx'
import { Section } from '../../components/shared/Section.tsx'
import { SectionDescription } from '../../components/shared/SectionDescription.tsx'

import '../../form.css'

// this form is rendered from the item view and from the filter
export const ProjectExportForm = ({ onChange, validations = {}, row, autoFocusRef }) => {
  const { formatMessage } = useIntl()

  const paramHint = (() => {
    if (row?.level === 'project') {
      return formatMessage({
        id: 'projectExport.sql.hintProject',
        defaultMessage: '$1 = project_id (uuid), $2 = year (integer, optional)',
      })
    }
    if (row?.level === 'subproject') {
      return formatMessage({
        id: 'projectExport.sql.hintSubproject',
        defaultMessage: '$1 = subproject_id (uuid), $2 = year (integer, optional)',
      })
    }
    return formatMessage({
      id: 'projectExport.sql.hintNone',
      defaultMessage: 'Set level to see available parameters.',
    })
  })()

  return (
    <>
      <Section
        title={formatMessage({ id: 'projectExport.section.name', defaultMessage: 'Name' })}
      >
        <SectionDescription>
          {formatMessage({
            id: 'projectExport.section.name.description',
            defaultMessage:
              'Hier wird der Name für den Export in allen Sprachen definiert. Fehlt eine Sprache, wird Deutsch verwendet.',
          })}
        </SectionDescription>
        <TextField
          label={formatMessage({
            id: 'projectExport.nameDe',
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
            id: 'projectExport.nameEn',
            defaultMessage: 'Englisch',
          })}
          name="name_en"
          value={row?.name_en ?? ''}
          onChange={onChange}
        />
        <TextField
          label={formatMessage({
            id: 'projectExport.nameFr',
            defaultMessage: 'Französisch',
          })}
          name="name_fr"
          value={row?.name_fr ?? ''}
          onChange={onChange}
        />
        <TextField
          label={formatMessage({
            id: 'projectExport.nameIt',
            defaultMessage: 'Italienisch',
          })}
          name="name_it"
          value={row?.name_it ?? ''}
          onChange={onChange}
        />
      </Section>
      <Section
        title={formatMessage({ id: 'projectExport.section.variables', defaultMessage: 'Variabeln' })}
      >
        <SectionDescription>
          {formatMessage({
            id: 'projectExport.section.variables.description',
            defaultMessage:
              'Diese Einstellung bestimmt, auf welcher Ebene der Export ausgeführt wird.',
          })}
        </SectionDescription>
        <RadioGroupField
          label={formatMessage({
            id: 'projectExport.level',
            defaultMessage: 'Auf welcher Ebene wird exportiert?',
          })}
          name="level"
          list={['project', 'subproject']}
          value={row?.level ?? null}
          onChange={onChange}
          labelMap={{
            project: formatMessage({ id: 'projectExport.level.project', defaultMessage: 'Projekt' }),
            subproject: formatMessage({
              id: 'projectExport.level.subproject',
              defaultMessage: 'Teilprojekt',
            }),
          }}
        />
      </Section>
      <Section
        title={formatMessage({ id: 'projectExport.section.query', defaultMessage: 'Abfrage' })}
      >
        <SectionDescription>
          {formatMessage({
            id: 'projectExport.section.query.description',
            defaultMessage:
              'Die Abfrage exportiert Daten. Sie retourniert beliebige Felder, die in der Exportdatei erscheinen.',
          })}
        </SectionDescription>
        <SqlEditorField
          label={formatMessage({ id: 'projectExport.sql', defaultMessage: 'SQL' })}
          name="sql"
          value={row?.sql ?? ''}
          onChange={onChange}
          hint={paramHint}
          validationMessage={validations?.sql?.message}
          validationState={validations?.sql?.state}
        />
      </Section>
    </>
  )
}
