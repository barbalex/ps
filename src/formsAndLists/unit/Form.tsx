import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { Section } from '../../components/shared/Section.tsx'

import '../../form.css'

// this form is rendered from a parent or outlet
export const UnitForm = ({ onChange, row, autoFocusRef, validations = {} }) => {
  const { formatMessage } = useIntl()

  return (
    <>
      <TextField
        label={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
        validationState={validations?.name?.state}
        validationMessage={validations?.name?.message}
      />
      <Section
        title={formatMessage({ id: 'Rc5DeF', defaultMessage: 'Verwenden für' })}
      >
        <SwitchField
          label={formatMessage({
            id: 'Xa1BcD',
            defaultMessage: 'Für Massnahmen-Mengen verwenden',
          })}
          name="use_for_action_values"
          value={row.use_for_action_values ?? false}
          onChange={onChange}
          validationState={validations?.use_for_action_values?.state}
          validationMessage={validations?.use_for_action_values?.message}
        />
        <SwitchField
          label={formatMessage({
            id: 'Yb2CdE',
            defaultMessage: 'Für Massnahmen-Berichte-Mengen verwenden',
          })}
          name="use_for_action_report_values"
          value={row.use_for_action_report_values ?? false}
          onChange={onChange}
          validationState={validations?.use_for_action_report_values?.state}
          validationMessage={validations?.use_for_action_report_values?.message}
        />
        <SwitchField
          label={formatMessage({
            id: 'Zc3DeF',
            defaultMessage: 'Für Kontroll-Mengen verwenden',
          })}
          name="use_for_check_values"
          value={row.use_for_check_values ?? false}
          onChange={onChange}
          validationState={validations?.use_for_check_values?.state}
          validationMessage={validations?.use_for_check_values?.message}
        />
        <SwitchField
          label={formatMessage({
            id: 'Ad4EfG',
            defaultMessage: 'Für Ort-Bericht-Mengen verwenden',
          })}
          name="use_for_place_report_values"
          value={row.use_for_place_report_values ?? false}
          onChange={onChange}
          validationState={validations?.use_for_place_report_values?.state}
          validationMessage={validations?.use_for_place_report_values?.message}
        />
        <SwitchField
          label={formatMessage({
            id: 'Be5FgH',
            defaultMessage: 'Für Ziel-Bericht-Mengen verwenden',
          })}
          name="use_for_goal_report_values"
          value={row.use_for_goal_report_values ?? false}
          onChange={onChange}
          validationState={validations?.use_for_goal_report_values?.state}
          validationMessage={validations?.use_for_goal_report_values?.message}
        />
        <SwitchField
          label={formatMessage({
            id: 'Cf6GhI',
            defaultMessage: 'Für Teilprojekt-Taxa verwenden',
          })}
          name="use_for_subproject_taxa"
          value={row.use_for_subproject_taxa ?? false}
          onChange={onChange}
          validationState={validations?.use_for_subproject_taxa?.state}
          validationMessage={validations?.use_for_subproject_taxa?.message}
        />
        <SwitchField
          label={formatMessage({
            id: 'Dg7HiJ',
            defaultMessage: 'Für Kontroll-Taxa verwenden',
          })}
          name="use_for_check_taxa"
          value={row.use_for_check_taxa ?? false}
          onChange={onChange}
          validationState={validations?.use_for_check_taxa?.state}
          validationMessage={validations?.use_for_check_taxa?.message}
        />
      </Section>
      <Section
        title={formatMessage({
          id: 'Rd6EfG',
          defaultMessage: 'Weitere Einstellungen',
        })}
      >
        <SwitchField
          label={formatMessage({ id: 'Eh8IjK', defaultMessage: 'Summierbar' })}
          name="summable"
          value={row.summable ?? false}
          onChange={onChange}
          validationState={validations?.summable?.state}
          validationMessage={validations?.summable?.message}
        />
        <TextField
          label={formatMessage({ id: 'Pq7nWk', defaultMessage: 'Sortierwert' })}
          name="sort"
          type="number"
          value={row.sort ?? ''}
          onChange={onChange}
          validationState={validations?.sort?.state}
          validationMessage={
            validations?.sort?.message ??
            formatMessage({
              id: 'Pq8RsT',
              defaultMessage:
                'Standardmässig wird nach Name sortiert. Das können Sie mit diesem Wert übersteuern: Je höher der Wert, desto weiter unten wird die Einheit angezeigt.',
            })
          }
        />
        <TextField
          label={formatMessage({ id: '4+BE1s', defaultMessage: 'Liste' })}
          name="list_id"
          value={row.list_id ?? ''}
          onChange={onChange}
          validationState={validations?.list_id?.state}
          validationMessage={validations?.list_id?.message}
        />
      </Section>
    </>
  )
}
