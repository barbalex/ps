import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { SqlEditorField } from '../../components/shared/SqlEditorField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { TextArea } from '../../components/shared/TextArea.tsx'
import { Section } from '../../components/shared/Section.tsx'
import { SectionDescription } from '../../components/shared/SectionDescription.tsx'

import '../../form.css'

// this form is rendered from the item view and from the filter
export const ProjectExportForm = ({ onChange, validations = {}, row, autoFocusRef }) => {
  const { formatMessage } = useIntl()

  const paramHint = (() => {
    if (row?.level === 'project') {
      return formatMessage({
        id: row?.filter_by_year ? 'projectExport.sql.hintProjectYear' : 'projectExport.sql.hintProject',
        defaultMessage: row?.filter_by_year
          ? '$1 = project_id (uuid), $2 = year (integer)'
          : '$1 = project_id (uuid)',
      })
    }
    if (row?.level === 'subproject') {
      return formatMessage({
        id: row?.filter_by_year ? 'projectExport.sql.hintSubprojectYear' : 'projectExport.sql.hintSubproject',
        defaultMessage: row?.filter_by_year
          ? '$1 = subproject_id (uuid), $2 = year (integer)'
          : '$1 = subproject_id (uuid)',
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
        <SwitchField
          label={formatMessage({
            id: 'projectExport.filterByYear',
            defaultMessage: 'Nach Jahr filtern',
          })}
          name="filter_by_year"
          value={row?.filter_by_year}
          onChange={onChange}
          hint={formatMessage({
            id: 'projectExport.filterByYearHint',
            defaultMessage:
              'Wenn wahr, wird der Abfrage eine Variable für das gewünschte Berichts-Jahr übergeben',
          })}
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
        <TextArea
          label={formatMessage({ id: 'projectExport.description', defaultMessage: 'Beschreibung' })}
          name="description"
          value={row?.description ?? ''}
          onChange={onChange}
        />
        <SqlEditorField
          label={formatMessage({ id: 'projectExport.sql', defaultMessage: 'SQL' })}
          name="sql"
          value={row?.sql ?? ''}
          onChange={onChange}
          hint={paramHint}
          validationMessage={validations?.sql?.message}
          validationState={validations?.sql?.state}
        />
        <TextField
          label={formatMessage({
            id: 'projectExport.baseTable',
            defaultMessage: 'Basis-Tabelle',
          })}
          name="base_table"
          value={row?.base_table ?? ''}
          onChange={onChange}
          hint={formatMessage({
            id: 'projectExport.baseTable.hint',
            defaultMessage:
              'Name der Haupt-Tabelle dieser Abfrage (z.B. projects, subprojects, places). Wird verwendet, um den aktuellen App-Filter anzuwenden.',
          })}
        />
      </Section>
    </>
  )
}
