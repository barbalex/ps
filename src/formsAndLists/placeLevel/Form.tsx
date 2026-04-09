import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { Section } from '../../components/shared/Section.tsx'
import { SectionLevel2 } from '../../components/shared/SectionLevel2.tsx'
import { SectionDescription } from '../../components/shared/SectionDescription.tsx'
import type PlaceLevels from '../../models/public/PlaceLevels.ts'

import '../../form.css'

type Props = {
  row: PlaceLevels
  onChange: (e: React.ChangeEvent<unknown>, data?: unknown) => Promise<void>
  validations?: Record<string, { state: string; message: string }>
  autoFocusRef?: React.Ref<HTMLInputElement>
}

export const PlaceLevelForm = ({
  row,
  onChange,
  validations,
  autoFocusRef,
}: Props) => {
  const { formatMessage, locale } = useIntl()
  const altInOwnFormNavMessage = formatMessage({
    id: 'altInOwnFormNav',
    defaultMessage:
      'Alternative: In eigenem Formular anzeigen, mit eigenem Ordner im Navigationsbaum',
  })
  const checksLabel = formatMessage({ id: 'sK0PjF', defaultMessage: 'Kontrollen' })
  const actionsLabel = formatMessage({ id: 'pH7MgC', defaultMessage: 'Massnahmen' })

  const lang = locale.split('-')[0]
  const placeNameSingular =
    row?.[`name_singular_${lang}`] ?? row?.name_singular_de ?? 'Ort'
  const placeName =
    row?.[`name_plural_${lang}`] ?? row?.name_plural_de ?? 'Orte'

  return (
    <>
      <SectionDescription marginTop={-10}>
        {formatMessage({
          id: 'pR0UwN',
          defaultMessage:
            'Es können ein oder zwei Ort-Stufen definiert werden. Beispiel für Arten: Population/Teil-Population.',
        })}
      </SectionDescription>
      <RadioGroupField
        label={formatMessage({ id: 'Lv9nRx', defaultMessage: 'Stufe' })}
        name="level"
        list={[1, 2]}
        layout="horizontal"
        value={row.level ?? ''}
        onChange={onChange}
        validationState={validations?.level?.state}
        validationMessage={validations?.level?.message}
      />
      <Section title={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}>
        <SectionDescription>
          {formatMessage({
            id: 'nP8QrS',
            defaultMessage:
              'Hier wird der Name für diese Ort-Stufe definiert. Damit er überall korrekt angezeigt werden kann, braucht es Einzahl, Mehrzahl und Kurzform, in allen verwendeten Sprachen. Fehlt eine Sprache, wird Deutsch verwendet.',
          })}
        </SectionDescription>
        <TextField
          label={formatMessage({ id: 'bT3YsO', defaultMessage: 'Deutsch: Einzahl' })}
          name="name_singular_de"
          value={row.name_singular_de ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
          validationState={validations?.name_singular_de?.state}
          validationMessage={validations?.name_singular_de?.message}
        />
        <TextField
          label={formatMessage({ id: 'cU4ZtP', defaultMessage: 'Deutsch: Mehrzahl' })}
          name="name_plural_de"
          value={row.name_plural_de ?? ''}
          onChange={onChange}
          validationState={validations?.name_plural_de?.state}
          validationMessage={validations?.name_plural_de?.message}
        />
        <TextField
          label={formatMessage({ id: 'eW6BvR', defaultMessage: 'Englisch: Einzahl' })}
          name="name_singular_en"
          value={row.name_singular_en ?? ''}
          onChange={onChange}
          validationState={validations?.name_singular_en?.state}
          validationMessage={validations?.name_singular_en?.message}
        />
        <TextField
          label={formatMessage({ id: 'fX7CwS', defaultMessage: 'Englisch: Mehrzahl' })}
          name="name_plural_en"
          value={row.name_plural_en ?? ''}
          onChange={onChange}
          validationState={validations?.name_plural_en?.state}
          validationMessage={validations?.name_plural_en?.message}
        />
        <TextField
          label={formatMessage({ id: 'hZ9EyU', defaultMessage: 'Französisch: Einzahl' })}
          name="name_singular_fr"
          value={row.name_singular_fr ?? ''}
          onChange={onChange}
          validationState={validations?.name_singular_fr?.state}
          validationMessage={validations?.name_singular_fr?.message}
        />
        <TextField
          label={formatMessage({ id: 'iA0FzV', defaultMessage: 'Französisch: Mehrzahl' })}
          name="name_plural_fr"
          value={row.name_plural_fr ?? ''}
          onChange={onChange}
          validationState={validations?.name_plural_fr?.state}
          validationMessage={validations?.name_plural_fr?.message}
        />
        <TextField
          label={formatMessage({ id: 'kC2HbX', defaultMessage: 'Italienisch: Einzahl' })}
          name="name_singular_it"
          value={row.name_singular_it ?? ''}
          onChange={onChange}
          validationState={validations?.name_singular_it?.state}
          validationMessage={validations?.name_singular_it?.message}
        />
        <TextField
          label={formatMessage({ id: 'lD3IcY', defaultMessage: 'Italienisch: Mehrzahl' })}
          name="name_plural_it"
          value={row.name_plural_it ?? ''}
          onChange={onChange}
          validationState={validations?.name_plural_it?.state}
          validationMessage={validations?.name_plural_it?.message}
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
        <SectionLevel2 title={placeName}>
          <SwitchField
            label={formatMessage({ id: 'vN3SmI', defaultMessage: 'Beobachtungen zugeordnet' })}
            name="observations"
            value={row.observations ?? false}
            onChange={onChange}
            validationState={validations?.observations?.state}
            validationMessage={validations?.observations?.message}
          />
          <SwitchField
            label={formatMessage({ id: 'aB1CdE', defaultMessage: 'Dateien' })}
            name="place_files"
            value={row.place_files ?? false}
            onChange={onChange}
            validationState={validations?.place_files?.state}
            validationMessage={validations?.place_files?.message}
          />
          <SwitchField
            label={formatMessage(
              {
                id: 'rP1UsQ',
                defaultMessage: '{placeNameSingular}-Benutzer in {placeNameSingular} anzeigen',
              },
              { placeNameSingular },
            )}
            name="place_users_in_place"
            value={row.place_users_in_place ?? true}
            onChange={onChange}
            validationState={validations?.place_users_in_place?.state}
            validationMessage={
              validations?.place_users_in_place?.message ??
              altInOwnFormNavMessage
            }
          />
          {row.place_files && (
            <SwitchField
              label={formatMessage(
                {
                  id: 'wQ9LmN',
                  defaultMessage: 'Dateien in {placeNameSingular} anzeigen',
                },
                { placeNameSingular },
              )}
              name="place_files_in_place"
              value={row.place_files_in_place ?? true}
              onChange={onChange}
              validationState={validations?.place_files_in_place?.state}
              validationMessage={
                validations?.place_files_in_place?.message ??
                altInOwnFormNavMessage
              }
            />
          )}
        </SectionLevel2>
        <SectionLevel2
          title={checksLabel}
        >
          <SwitchField
            label={checksLabel}
            name="checks"
            value={row.checks ?? false}
            onChange={onChange}
            validationState={validations?.checks?.state}
            validationMessage={validations?.checks?.message}
          />
          {row.checks && (
            <>
              <SwitchField
                label={formatMessage({ id: 'tL1QkG', defaultMessage: 'Kontroll-Mengen' })}
                name="check_quantities"
                value={row.check_quantities ?? false}
                onChange={onChange}
                validationState={validations?.check_quantities?.state}
                validationMessage={validations?.check_quantities?.message}
              />
              {row.check_quantities && (
                <SwitchField
                  label={formatMessage({ id: 'dR0VsL', defaultMessage: 'Kontroll-Mengen in Kontrolle anzeigen' })}
                  name="check_quantities_in_check"
                  value={row.check_quantities_in_check ?? true}
                  onChange={onChange}
                  validationState={validations?.check_quantities_in_check?.state}
                  validationMessage={
                    validations?.check_quantities_in_check?.message ??
                    altInOwnFormNavMessage
                  }
                />
              )}
              <SwitchField
                label={formatMessage({ id: 'uM2RlH', defaultMessage: 'Taxa' })}
                name="check_taxa"
                value={row.check_taxa ?? false}
                onChange={onChange}
                validationState={validations?.check_taxa?.state}
                validationMessage={validations?.check_taxa?.message}
              />
              {row.check_taxa && (
                <SwitchField
                  label={formatMessage({ id: 'gE4ItL', defaultMessage: 'Taxa in Kontrolle anzeigen' })}
                  name="check_taxa_in_check"
                  value={row.check_taxa_in_check ?? true}
                  onChange={onChange}
                  validationState={validations?.check_taxa_in_check?.state}
                  validationMessage={
                    validations?.check_taxa_in_check?.message ??
                    altInOwnFormNavMessage
                  }
                />
              )}
              <SwitchField
                label={formatMessage({ id: 'kL3MnO', defaultMessage: 'Dateien' })}
                name="check_files"
                value={row.check_files ?? false}
                onChange={onChange}
                validationState={validations?.check_files?.state}
                validationMessage={validations?.check_files?.message}
              />
              {row.check_files && (
                <SwitchField
                  label={formatMessage({ id: 'rN5QwT', defaultMessage: 'Dateien in Kontrolle anzeigen' })}
                  name="check_files_in_check"
                  value={row.check_files_in_check ?? true}
                  onChange={onChange}
                  validationState={validations?.check_files_in_check?.state}
                  validationMessage={
                    validations?.check_files_in_check?.message ??
                    altInOwnFormNavMessage
                  }
                />
              )}
              <SwitchField
                label={formatMessage({ id: 'nF5KeA', defaultMessage: 'Berichte' })}
                name="check_reports"
                value={row.check_reports ?? false}
                onChange={onChange}
                validationState={validations?.check_reports?.state}
                validationMessage={validations?.check_reports?.message}
              />
              {row.check_reports && (
                <>
                  <SwitchField
                    label={formatMessage({ id: 'oG6LfB', defaultMessage: 'Bericht-Mengen' })}
                    name="check_report_quantities"
                    value={row.check_report_quantities ?? false}
                    onChange={onChange}
                    validationState={validations?.check_report_quantities?.state}
                    validationMessage={validations?.check_report_quantities?.message}
                  />
                  {row.check_report_quantities && (
                    <SwitchField
                      label={formatMessage({ id: 'qH7MpR4', defaultMessage: 'Bericht-Mengen im Bericht anzeigen' })}
                      name="check_report_quantities_in_report"
                      value={row.check_report_quantities_in_report ?? true}
                      onChange={onChange}
                      validationState={validations?.check_report_quantities_in_report?.state}
                      validationMessage={
                        validations?.check_report_quantities_in_report?.message ??
                        altInOwnFormNavMessage
                      }
                    />
                  )}
                </>
              )}
            </>
          )}
        </SectionLevel2>
        <SectionLevel2
          title={actionsLabel}
        >
          <SwitchField
            label={actionsLabel}
            name="actions"
            value={row.actions ?? false}
            onChange={onChange}
            validationState={validations?.actions?.state}
            validationMessage={validations?.actions?.message}
          />
          {row.actions && (
            <>
              <SwitchField
                label={formatMessage({ id: 'qI8NhD', defaultMessage: 'Massnahmen-Mengen' })}
                name="action_quantities"
                value={row.action_quantities ?? false}
                onChange={onChange}
                validationState={validations?.action_quantities?.state}
                validationMessage={validations?.action_quantities?.message}
              />
              {row.action_quantities && (
                <SwitchField
                  label={formatMessage({ id: 'fD5OsU', defaultMessage: 'Massnahmen-Mengen in Massnahme anzeigen' })}
                  name="action_quantities_in_action"
                  value={row.action_quantities_in_action ?? true}
                  onChange={onChange}
                  validationState={validations?.action_quantities_in_action?.state}
                  validationMessage={
                    validations?.action_quantities_in_action?.message ??
                    altInOwnFormNavMessage
                  }
                />
              )}
              <SwitchField
                label={formatMessage({ id: 'pQ2RsT', defaultMessage: 'Taxa' })}
                name="action_taxa"
                value={row.action_taxa ?? false}
                onChange={onChange}
                validationState={validations?.action_taxa?.state}
                validationMessage={validations?.action_taxa?.message}
              />
              {row.action_taxa && (
                <SwitchField
                  label={formatMessage({ id: 'rS3TuV', defaultMessage: 'Taxa in Massnahme anzeigen' })}
                  name="action_taxa_in_action"
                  value={row.action_taxa_in_action ?? true}
                  onChange={onChange}
                  validationState={validations?.action_taxa_in_action?.state}
                  validationMessage={
                    validations?.action_taxa_in_action?.message ??
                    altInOwnFormNavMessage
                  }
                />
              )}
              <SwitchField
                label={formatMessage({ id: 'fG2HiJ', defaultMessage: 'Dateien' })}
                name="action_files"
                value={row.action_files ?? false}
                onChange={onChange}
                validationState={validations?.action_files?.state}
                validationMessage={validations?.action_files?.message}
              />
              {row.action_files && (
                <SwitchField
                  label={formatMessage({ id: 'gH3IjK', defaultMessage: 'Dateien in Massnahme anzeigen' })}
                  name="action_files_in_action"
                  value={row.action_files_in_action ?? true}
                  onChange={onChange}
                  validationState={validations?.action_files_in_action?.state}
                  validationMessage={
                    validations?.action_files_in_action?.message ??
                    altInOwnFormNavMessage
                  }
                />
              )}
              <SwitchField
                label={formatMessage({ id: 'eV3FxH', defaultMessage: 'Berichte' })}
                name="action_reports"
                value={row.action_reports ?? false}
                onChange={onChange}
                validationState={validations?.action_reports?.state}
                validationMessage={validations?.action_reports?.message}
              />
              {row.action_reports && (
                <>
                  <SwitchField
                    label={formatMessage({ id: 'fW4GyI', defaultMessage: 'Bericht-Mengen' })}
                    name="action_report_quantities"
                    value={row.action_report_quantities ?? false}
                    onChange={onChange}
                    validationState={validations?.action_report_quantities?.state}
                    validationMessage={validations?.action_report_quantities?.message}
                  />
                  {row.action_report_quantities && (
                    <SwitchField
                      label={formatMessage({ id: 'gX5HzJ', defaultMessage: 'Bericht-Mengen im Bericht anzeigen' })}
                      name="action_report_quantities_in_report"
                      value={row.action_report_quantities_in_report ?? true}
                      onChange={onChange}
                      validationState={validations?.action_report_quantities_in_report?.state}
                      validationMessage={
                        validations?.action_report_quantities_in_report?.message ??
                        altInOwnFormNavMessage
                      }
                    />
                  )}
                </>
              )}
            </>
          )}
        </SectionLevel2>
      </Section>
    </>
  )
}
