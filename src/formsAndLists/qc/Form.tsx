import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { SqlEditorField } from '../../components/shared/SqlEditorField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { Section } from '../../components/shared/Section.tsx'
import { SectionDescription } from '../../components/shared/SectionDescription.tsx'

import '../../form.css'

// this form is rendered from the item view and from the filter
export const QcForm = ({ onChange, validations = {}, row, autoFocusRef }) => {
  const { formatMessage } = useIntl()

  // Build the parameter hint based on which level flags are set
  const paramHint = (() => {
    const parts: string[] = []
    if (row?.level === 'root') {
      if (row?.filter_by_year) {
        parts.push(
          formatMessage({
            id: 'qc.sql.hintRootYear',
            defaultMessage: '$1 = year (integer)',
          }),
        )
      } else {
        parts.push(
          formatMessage({
            id: 'qc.sql.hintRoot',
            defaultMessage: 'no parameters needed.',
          }),
        )
      }
    }
    if (row?.level === 'project') {
      if (row?.filter_by_year) {
        parts.push(
          formatMessage({
            id: 'qc.sql.hintProjectYear',
            defaultMessage: '$1 = project_id (uuid), $2 = year (integer)',
          }),
        )
      } else {
        parts.push(
          formatMessage({
            id: 'qc.sql.hintProject',
            defaultMessage: '$1 = project_id (uuid)',
          }),
        )
      }
    }
    if (row?.level === 'subproject') {
      if (row?.filter_by_year) {
        parts.push(
          formatMessage({
            id: 'qc.sql.hintSubprojectYear',
            defaultMessage: '$1 = subproject_id (uuid), $2 = year (integer)',
          }),
        )
      } else {
        parts.push(
          formatMessage({
            id: 'qc.sql.hintSubproject',
            defaultMessage: '$1 = subproject_id (uuid)',
          }),
        )
      }
    }
    return parts.length
      ? parts.join('\n')
      : formatMessage({
          id: 'qc.sql.hintNone',
          defaultMessage:
            'Set level to see available parameters.',
        })
  })()

  return (
    <>
      <Section
        title={formatMessage({ id: 'qc.section.name', defaultMessage: 'Name' })}
      >
        <SectionDescription>
          {formatMessage({
            id: 'qc.section.name.description',
            defaultMessage:
              'Hier wird der Name für die Qualitäts-Kontrolle in allen Sprachen definiert. Fehlt eine Sprache, wird Deutsch verwendet.',
          })}
        </SectionDescription>
        <TextField
          label={formatMessage({
            id: 'qc.nameDe',
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
            id: 'qc.nameEn',
            defaultMessage: 'Englisch',
          })}
          name="name_en"
          value={row?.name_en ?? ''}
          onChange={onChange}
        />
        <TextField
          label={formatMessage({
            id: 'qc.nameFr',
            defaultMessage: 'Französisch',
          })}
          name="name_fr"
          value={row?.name_fr ?? ''}
          onChange={onChange}
        />
        <TextField
          label={formatMessage({
            id: 'qc.nameIt',
            defaultMessage: 'Italienisch',
          })}
          name="name_it"
          value={row?.name_it ?? ''}
          onChange={onChange}
        />
      </Section>
      <Section
        title={formatMessage({ id: 'qc.section.variables', defaultMessage: 'Variabeln' })}
      >
        <SectionDescription>
          {formatMessage({
            id: 'qc.section.variables.description',
            defaultMessage:
              'Diese Einstellungen bestimmen, welche Variabeln der Abfrage übergeben werden.',
          })}
        </SectionDescription>
        <RadioGroupField
          label={formatMessage({
            id: 'qc.level',
            defaultMessage: 'Auf welcher Ebene wird Qualität kontrolliert?',
          })}
          name="level"
          list={['root', 'project', 'subproject']}
          value={row?.level ?? null}
          onChange={onChange}
          labelMap={{
            root: formatMessage({ id: 'qc.level.root', defaultMessage: 'Root' }),
            project: formatMessage({ id: 'qc.level.project', defaultMessage: 'Projekt' }),
            subproject: formatMessage({ id: 'qc.level.subproject', defaultMessage: 'Teilprojekt' }),
          }}
        />
        <SwitchField
          label={formatMessage({
            id: 'qc.filterByYear',
            defaultMessage: 'Nach Jahr filtern',
          })}
          name="filter_by_year"
          value={row?.filter_by_year}
          onChange={onChange}
          hint={formatMessage({
            id: 'qc.filterByYearHint',
            defaultMessage:
              'Wenn wahr, wird der Abfrage eine Variable für das gewünschte Berichts-Jahr übergeben',
          })}
        />
      </Section>
      <Section
        title={formatMessage({ id: 'qc.section.query', defaultMessage: 'Abfrage' })}
      >
        <SectionDescription>
          {formatMessage({
            id: 'qc.section.query.description',
            defaultMessage:
              'Die Abfrage soll verdächtige Datensätze aufdecken. Sie retourniert zwei Felder: label (Beschriftung) und url (ein Link um den Datensatz aufzurufen).',
          })}
        </SectionDescription>
        <TextField
          label={formatMessage({
            id: 'qc.description',
            defaultMessage: 'Beschreibung',
          })}
          name="description"
          value={row?.description ?? ''}
          onChange={onChange}
          validationMessage={validations?.description?.message}
          validationState={validations?.description?.state}
        />
        <SqlEditorField
          label={formatMessage({ id: 'qc.sql', defaultMessage: 'SQL' })}
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
