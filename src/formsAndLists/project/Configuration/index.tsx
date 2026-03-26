import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Label } = fluentUiReactComponents
import { useSetAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { TextField } from '../../../components/shared/TextField.tsx'
import { TextFieldInactive } from '../../../components/shared/TextFieldInactive.tsx'
import { RadioGroupField } from '../../../components/shared/RadioGroupField.tsx'
import { LabelBy } from '../../../components/shared/LabelBy.tsx'
import { FieldList } from '../../../components/shared/FieldList/index.tsx'
import { SwitchField } from '../../../components/shared/SwitchField.tsx'
import { Section } from '../../../components/shared/Section.tsx'
import { SectionDescription } from '../../../components/shared/SectionDescription.tsx'
import { Type } from './Type.tsx'
import { Loading } from '../../../components/shared/Loading.tsx'
import { NotFound } from '../../../components/NotFound.tsx'
import { FormHeader } from '../../../components/FormHeader/index.tsx'
import { getValueFromChange } from '../../../modules/getValueFromChange.ts'
import { addOperationAtom } from '../../../store.ts'
import { projectTypeNames } from '../../../modules/projectTypeNames.ts'
import type Projects from '../../../models/public/Projects.ts'
import type Units from '../../../models/public/Units.ts'

export const Configuration = ({ from }) => {
  const { projectId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage, locale } = useIntl()
  const [validations, setValidations] = useState({})

  const db = usePGlite()

  const res = useLiveQuery(`SELECT * FROM projects WHERE project_id = $1`, [
    projectId,
  ])
  const row: Projects | undefined = res?.rows?.[0]

  const unitsRes = useLiveQuery(
    `SELECT unit_id, name FROM units WHERE project_id = $1 ORDER BY sort, name`,
    [projectId],
  )
  const units: Pick<Units, 'unit_id' | 'name'>[] = unitsRes?.rows ?? []
  const unitIds = units.map((u) => u.unit_id)
  const unitLabelMap = Object.fromEntries(
    units.map((u) => [u.unit_id, u.name ?? u.unit_id]),
  )

  const lang = locale.split('-')[0]
  const subprojectName =
    row?.[`subproject_name_plural_${lang}`] ??
    row?.subproject_name_plural ??
    'Arten'

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    if (name === 'type') {
      const names = projectTypeNames[value] ?? {}
      const allData = { type: value, ...names }
      const setClauses = Object.keys(allData)
        .map((col, i) => `${col} = $${i + 1}`)
        .join(', ')
      try {
        await db.query(
          `UPDATE projects SET ${setClauses} WHERE project_id = $${Object.keys(allData).length + 1}`,
          [...Object.values(allData), projectId],
        )
      } catch (error) {
        setValidations((prev) => ({
          ...prev,
          [name]: { state: 'error', message: error.message },
        }))
        return
      }
      addOperation({
        table: 'projects',
        rowIdName: 'project_id',
        rowId: projectId,
        operation: 'update',
        draft: allData,
        prev: { ...row },
      })
      return
    }

    try {
      await db.query(`UPDATE projects SET ${name} = $1 WHERE project_id = $2`, [
        value,
        projectId,
      ])
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error.message },
      }))
      return
    }
    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _, ...rest } = prev
      return rest
    })
    // add task to update server and rollback PGlite in case of error
    // https://tanstack.com/db/latest/docs/collections/electric-collection?
    // TODO: use this everywhere
    addOperation({
      table: 'projects',
      rowIdName: 'project_id',
      rowId: projectId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'fz2AhZ', defaultMessage: 'Projekt' })}
        id={projectId}
      />
    )
  }

  return (
    <div className="form-outer-container">
      <FormHeader
        title={formatMessage({
          id: 'zM4NoP',
          defaultMessage: 'Projekt-Konfiguration',
        })}
      />
      <div className="form-container" role="tabpanel" aria-labelledby="form">
        <Type row={row} onChange={onChange} validations={validations} />
        <Section
          title={formatMessage({
            id: 'aQ5RsT',
            defaultMessage: 'Teil-Projekt-Name',
          })}
        >
          <SectionDescription>
            {formatMessage({
              id: 'pQ9StU',
              defaultMessage:
                'Hier wird der Name für Teil-Projekte definiert. Damit er überall korrekt angezeigt werden kann, braucht es Einzahl und Mehrzahl, in allen verwendeten Sprachen. Fehlt eine Sprache, wird Deutsch verwendet.',
            })}
          </SectionDescription>
          <TextField
            label={formatMessage({
              id: 'bT3YsO',
              defaultMessage: 'Deutsch: Einzahl',
            })}
            name="subproject_name_singular"
            value={row.subproject_name_singular ?? ''}
            onChange={onChange}
            validationState={validations?.subproject_name_singular?.state}
            validationMessage={validations?.subproject_name_singular?.message}
          />
          <TextField
            label={formatMessage({
              id: 'cU4ZtP',
              defaultMessage: 'Deutsch: Mehrzahl',
            })}
            name="subproject_name_plural"
            value={row.subproject_name_plural ?? ''}
            onChange={onChange}
            validationState={validations?.subproject_name_plural?.state}
            validationMessage={validations?.subproject_name_plural?.message}
          />
          <TextField
            label={formatMessage({
              id: 'eW6BvR',
              defaultMessage: 'Englisch: Einzahl',
            })}
            name="subproject_name_singular_en"
            value={row.subproject_name_singular_en ?? ''}
            onChange={onChange}
            validationState={validations?.subproject_name_singular_en?.state}
            validationMessage={
              validations?.subproject_name_singular_en?.message
            }
          />
          <TextField
            label={formatMessage({
              id: 'fX7CwS',
              defaultMessage: 'Englisch: Mehrzahl',
            })}
            name="subproject_name_plural_en"
            value={row.subproject_name_plural_en ?? ''}
            onChange={onChange}
            validationState={validations?.subproject_name_plural_en?.state}
            validationMessage={validations?.subproject_name_plural_en?.message}
          />
          <TextField
            label={formatMessage({
              id: 'hZ9EyU',
              defaultMessage: 'Französisch: Einzahl',
            })}
            name="subproject_name_singular_fr"
            value={row.subproject_name_singular_fr ?? ''}
            onChange={onChange}
            validationState={validations?.subproject_name_singular_fr?.state}
            validationMessage={
              validations?.subproject_name_singular_fr?.message
            }
          />
          <TextField
            label={formatMessage({
              id: 'iA0FzV',
              defaultMessage: 'Französisch: Mehrzahl',
            })}
            name="subproject_name_plural_fr"
            value={row.subproject_name_plural_fr ?? ''}
            onChange={onChange}
            validationState={validations?.subproject_name_plural_fr?.state}
            validationMessage={validations?.subproject_name_plural_fr?.message}
          />
          <TextField
            label={formatMessage({
              id: 'kC2HbX',
              defaultMessage: 'Italienisch: Einzahl',
            })}
            name="subproject_name_singular_it"
            value={row.subproject_name_singular_it ?? ''}
            onChange={onChange}
            validationState={validations?.subproject_name_singular_it?.state}
            validationMessage={
              validations?.subproject_name_singular_it?.message
            }
          />
          <TextField
            label={formatMessage({
              id: 'lD3IcY',
              defaultMessage: 'Italienisch: Mehrzahl',
            })}
            name="subproject_name_plural_it"
            value={row.subproject_name_plural_it ?? ''}
            onChange={onChange}
            validationState={validations?.subproject_name_plural_it?.state}
            validationMessage={validations?.subproject_name_plural_it?.message}
          />
        </Section>
        <Section
          title={formatMessage({
            id: 'pV5WxY',
            defaultMessage: 'Standard-Einheiten',
          })}
        >
          <SectionDescription>
            {formatMessage({
              id: 'rX7ZaC',
              defaultMessage:
                'Sie können hier Standard-Einheiten wählen. Die Standard-Einheit wird bei neuen Datensätzen voreingestellt, kann aber verändert werden. Standardisierung der verwendeten Einheiten ermöglicht es, Daten systematisch zu vergleichen/analysieren. Sie müssen natürlich auch dafür sorgen, dass die Daten tatsächlich mit diesen Einheiten erfasst werden (Qualitätskontrollen können helfen).',
            })}
          </SectionDescription>
          <RadioGroupField
            label={formatMessage({
              id: 'cU1DvF',
              defaultMessage:
                'Standard-Einheit für Ort-Kontroll-Bericht-Mengen',
            })}
            name="place_check_reports_default_unit_id"
            list={unitIds}
            labelMap={unitLabelMap}
            isLoading={unitsRes === undefined}
            value={row.place_check_reports_default_unit_id ?? ''}
            onChange={onChange}
            validationState={
              validations?.place_check_reports_default_unit_id?.state
            }
            validationMessage={
              validations?.place_check_reports_default_unit_id?.message
            }
          />
          <RadioGroupField
            label={formatMessage({
              id: 'qB8CdE',
              defaultMessage: 'Standard-Einheit für Kontroll-Mengen',
            })}
            name="checks_default_unit_id"
            list={unitIds}
            labelMap={unitLabelMap}
            isLoading={unitsRes === undefined}
            value={row.checks_default_unit_id ?? ''}
            onChange={onChange}
            validationState={validations?.checks_default_unit_id?.state}
            validationMessage={validations?.checks_default_unit_id?.message}
          />
          <RadioGroupField
            label={formatMessage({
              id: 'mP7QrS',
              defaultMessage: 'Standard-Einheit für Kontroll-Taxon-Mengen',
            })}
            name="check_taxa_default_unit_id"
            list={unitIds}
            labelMap={unitLabelMap}
            isLoading={unitsRes === undefined}
            value={row.check_taxa_default_unit_id ?? ''}
            onChange={onChange}
            validationState={validations?.check_taxa_default_unit_id?.state}
            validationMessage={validations?.check_taxa_default_unit_id?.message}
          />
          <RadioGroupField
            label={formatMessage({
              id: 'dV2EwG',
              defaultMessage:
                'Standard-Einheit für Ort-Massnahmen-Bericht-Mengen',
            })}
            name="place_action_reports_default_unit_id"
            list={unitIds}
            labelMap={unitLabelMap}
            isLoading={unitsRes === undefined}
            value={row.place_action_reports_default_unit_id ?? ''}
            onChange={onChange}
            validationState={
              validations?.place_action_reports_default_unit_id?.state
            }
            validationMessage={
              validations?.place_action_reports_default_unit_id?.message
            }
          />
          <RadioGroupField
            label={formatMessage({
              id: 'nR6StU',
              defaultMessage: 'Standard-Einheit für Massnahmen-Mengen',
            })}
            name="actions_default_unit_id"
            list={unitIds}
            labelMap={unitLabelMap}
            isLoading={unitsRes === undefined}
            value={row.actions_default_unit_id ?? ''}
            onChange={onChange}
            validationState={validations?.actions_default_unit_id?.state}
            validationMessage={validations?.actions_default_unit_id?.message}
          />
          <RadioGroupField
            label={formatMessage({
              id: 'bT0CsE',
              defaultMessage: 'Standard-Einheit für Massnahmen-Taxon-Mengen',
            })}
            name="action_taxa_default_unit_id"
            list={unitIds}
            labelMap={unitLabelMap}
            isLoading={unitsRes === undefined}
            value={row.action_taxa_default_unit_id ?? ''}
            onChange={onChange}
            validationState={validations?.action_taxa_default_unit_id?.state}
            validationMessage={
              validations?.action_taxa_default_unit_id?.message
            }
          />
        </Section>
        <Section
          title={formatMessage({
            id: 'sT8UvW',
            defaultMessage: 'Wie Daten für Berichte ausgewertet werden',
          })}
        >
          <Label>
            {formatMessage({
              id: 'iW3XyZ',
              defaultMessage: 'Wert(e) für Berichte wenn:',
            })}
          </Label>
          <RadioGroupField
            label={formatMessage({
              id: 'jA4BeC',
              defaultMessage: '...Werte auf mehreren Ort-Stufen',
            })}
            name="values_on_multiple_levels"
            list={['first', 'second', 'all']}
            value={row.values_on_multiple_levels ?? ''}
            onChange={onChange}
            validationState={validations?.values_on_multiple_levels?.state}
            validationMessage={validations?.values_on_multiple_levels?.message}
          />
          <RadioGroupField
            label={formatMessage({
              id: 'kD5EfG',
              defaultMessage:
                '...mehrere Massnahmen-Mengen auf gleicher Ort-Stufe',
            })}
            name="multiple_action_quantities_on_same_level"
            list={['first', 'last', 'all']}
            value={row.multiple_action_quantities_on_same_level ?? ''}
            onChange={onChange}
            validationState={
              validations.multiple_action_quantities_on_same_level?.state
            }
            validationMessage={
              validations.multiple_action_quantities_on_same_level?.message
            }
          />
          <RadioGroupField
            label={formatMessage({
              id: 'lH6IjK',
              defaultMessage:
                '...mehrere Kontroll-Mengen auf gleicher Ort-Stufe',
            })}
            name="multiple_check_quantities_on_same_level"
            list={['first', 'last', 'all']}
            value={row.multiple_check_quantities_on_same_level ?? ''}
            onChange={onChange}
            validationState={
              validations.multiple_check_quantities_on_same_level?.state
            }
            validationMessage={
              validations.multiple_check_quantities_on_same_level?.message
            }
          />
        </Section>
        <Section
          title={formatMessage({ id: 'yR6TsL', defaultMessage: 'Fähigkeiten' })}
        >
          <SectionDescription>
            {formatMessage({
              id: 'qS1VxO',
              defaultMessage:
                'Sie können die folgenden Fähigkeiten nach Ihren Bedürfnissen ein- oder ausschalten. Nicht benötigte deaktivieren ist empfohlen, weil es die Benutzeroberfläche im normalen Bearbeitungs-Modus vereinfacht. Im Design-Modus sind alle Fähigkeiten aktiviert.',
            })}
          </SectionDescription>
          <div className="checkboxfield-list">
            <SwitchField
              label={`${formatMessage({ id: 'x9x+dX', defaultMessage: 'Projekte' })}: ${formatMessage({ id: 'CiJ0SG', defaultMessage: 'Berichte' })}`}
              name="project_reports"
              value={row.project_reports ?? true}
              onChange={onChange}
              validationState={validations?.project_reports?.state}
              validationMessage={validations?.project_reports?.message}
            />
            <SwitchField
              label={formatMessage({
                id: 'tV2WxY',
                defaultMessage: 'Projekte: WMS-Dienste und WMS-Ebenen',
              })}
              name="wms_layers"
              value={row.wms_layers ?? false}
              onChange={onChange}
              validationState={validations?.wms_layers?.state}
              validationMessage={validations?.wms_layers?.message}
            />
            <SwitchField
              label={formatMessage({
                id: 'vX4YzA',
                defaultMessage: 'Projekte: WFS-Dienste und Vektor-Ebenen',
              })}
              name="vector_layers"
              value={row.vector_layers ?? false}
              onChange={onChange}
              validationState={validations?.vector_layers?.state}
              validationMessage={validations?.vector_layers?.message}
            />
            <SwitchField
              label={`${formatMessage({ id: 'x9x+dX', defaultMessage: 'Projekte' })}: ${formatMessage({ id: 'aB1CdE', defaultMessage: 'Dateien' })}`}
              name="files_active_projects"
              value={row.files_active_projects ?? false}
              onChange={onChange}
              validationState={validations?.files_active_projects?.state}
              validationMessage={validations?.files_active_projects?.message}
            />
            <SwitchField
              label={`${subprojectName}: ${formatMessage({ id: 'CiJ0SG', defaultMessage: 'Berichte' })}`}
              name="subproject_reports"
              value={row.subproject_reports ?? true}
              onChange={onChange}
              validationState={validations?.subproject_reports?.state}
              validationMessage={validations?.subproject_reports?.message}
            />
            <SwitchField
              label={`${subprojectName}: ${formatMessage({ id: '3srcwg', defaultMessage: 'Ziele' })}`}
              name="goals"
              value={row.goals ?? true}
              onChange={onChange}
              validationState={validations?.goals?.state}
              validationMessage={validations?.goals?.message}
            />
            <SwitchField
              label={`${subprojectName}: ${formatMessage({ id: 'yK5Pq6', defaultMessage: 'Beobachtungen (inkl. Importe)' })}`}
              name="occurrences"
              value={row.occurrences ?? true}
              onChange={onChange}
              validationState={validations?.occurrences?.state}
              validationMessage={validations?.occurrences?.message}
            />
            <SwitchField
              label={`${subprojectName}: ${formatMessage({ id: '7sVbg1', defaultMessage: 'Taxa' })}`}
              name="taxa"
              value={row.taxa ?? true}
              onChange={onChange}
              validationState={validations?.taxa?.state}
              validationMessage={validations?.taxa?.message}
            />
            <SwitchField
              label={`${subprojectName}: ${formatMessage({ id: 'ZPEO8P', defaultMessage: 'Diagramme' })}`}
              name="charts"
              value={row.charts ?? true}
              onChange={onChange}
              validationState={validations?.charts?.state}
              validationMessage={validations?.charts?.message}
            />
            <SwitchField
              label={`${subprojectName}: ${formatMessage({ id: 'aB1CdE', defaultMessage: 'Dateien' })}`}
              name="files_active_subprojects"
              value={row.files_active_subprojects ?? false}
              onChange={onChange}
              validationState={validations?.files_active_subprojects?.state}
              validationMessage={validations?.files_active_subprojects?.message}
            />
          </div>
        </Section>
        <Section
          title={formatMessage({
            id: 'bU6VwX',
            defaultMessage: 'Weitere Einstellungen',
          })}
        >
          <TextField
            label={formatMessage({
              id: 'cY7ZaB',
              defaultMessage: 'Teilprojekt sortieren nach (Feldname)',
            })}
            name="subproject_order_by"
            value={row.subproject_order_by ?? ''}
            onChange={onChange}
            validationState={validations?.subproject_order_by?.state}
            validationMessage={validations?.subproject_order_by?.message}
          />
          <LabelBy
            label={formatMessage({
              id: 'dC8DeF',
              defaultMessage: 'Berichte beschriften nach',
            })}
            name="goal_reports_label_by"
            table="goal_reports"
            value={row.goal_reports_label_by ?? ''}
            onChange={onChange}
            extraFieldNames={['id']}
            from={from}
            validationState={validations?.goal_reports_label_by?.state}
            validationMessage={validations?.goal_reports_label_by?.message}
          />
          <LabelBy
            label={formatMessage({
              id: 'eG9HiJ',
              defaultMessage: 'Orte beschriften nach',
            })}
            name="places_label_by"
            table="places"
            value={row.places_label_by ?? ''}
            onChange={onChange}
            extraFieldNames={['id', 'level']}
            from={from}
            validationState={validations?.places_label_by?.state}
            validationMessage={validations?.places_label_by?.message}
          />
          <FieldList
            label={formatMessage({
              id: 'fK0LmN',
              defaultMessage: 'Orte sortieren nach',
            })}
            name="places_order_by"
            table="projects"
            fieldsTable="places"
            id={projectId}
            valueArray={row.places_order_by ?? []}
            from={from}
          />
          <TextFieldInactive
            label={formatMessage({
              id: 'gO1PqR',
              defaultMessage: 'Karten-Präsentations-KBS',
            })}
            name="map_presentation_crs"
            value={row.map_presentation_crs ?? 'EPSG:4326'}
            validationMessage={formatMessage({
              id: 'hS2TuV',
              defaultMessage: 'Wähle ein KBS in der KBS-Liste',
            })}
          />
          <SwitchField
            label={formatMessage({
              id: 'mL7MnO',
              defaultMessage: 'Dateien lokal speichern (offline verfügbar)',
            })}
            name="files_offline"
            value={row.files_offline}
            onChange={onChange}
            validationState={validations?.files_offline?.state}
            validationMessage={validations?.files_offline?.message}
          />
        </Section>
      </div>
    </div>
  )
}
