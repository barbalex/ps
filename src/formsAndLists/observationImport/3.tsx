import { useIntl } from 'react-intl'

import { DropdownFieldSimpleOptions } from '../../components/shared/DropdownFieldSimpleOptions.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { Set } from './3/Set.tsx'
import type ObservationImports from '../../models/public/ObservationImports.ts'
import type { FieldChangeData } from '../../components/shared/fieldChange.ts'

export const Three = ({
  observationImport,
  observationFields,
  onChange,
  validations,
}: {
  observationImport: ObservationImports
  observationFields: string[]
  onChange: (
    e: React.ChangeEvent<HTMLElement>,
    data?: FieldChangeData,
  ) => Promise<void>
  validations?: Record<string, { state: 'error'; message: string }>
}) => {
  const { formatMessage } = useIntl()

  return (
    <>
      <RadioGroupField
        label={formatMessage({
          id: 'absMthLb',
          defaultMessage: 'Wie werden Absenzen in den Daten markiert?',
        })}
        name="absence_method"
        list={['boolean_column', 'sql_expression']}
        labelMap={{
          boolean_column: formatMessage({
            id: 'absMthCl',
            defaultMessage: 'Boolesche Spalte',
          }),
          sql_expression: formatMessage({
            id: 'absMthEx',
            defaultMessage: 'SQL-Ausdruck',
          }),
        }}
        value={observationImport.absence_method ?? ''}
        onChange={onChange}
        validationState={validations?.absence_method?.state}
        validationMessage={
          validations?.absence_method?.message ??
          formatMessage({
            id: 'absMthVl',
            defaultMessage:
              'Boolesche Spalten und SQL-Ausdrücke werden unterstützt. Keine Auswahl: keine Absenzen. Die Auswahl erneut anklicken, um sie zu entfernen.',
          })
        }
      />
      {observationImport.absence_method === 'boolean_column' && (
        <DropdownFieldSimpleOptions
          label={formatMessage({
            id: 'absFldLb',
            defaultMessage: 'Absenzen-Feld',
          })}
          name="absence_field"
          value={observationImport.absence_field ?? ''}
          onChange={onChange}
          options={observationFields}
          validationState={validations?.absence_field?.state}
          validationMessage={
            validations?.absence_field?.message ??
            formatMessage({
              id: 'absFldVl',
              defaultMessage:
                'Welches Feld enthält einen Wert, der true ist, wenn die Art nicht gefunden wurde?',
            })
          }
        />
      )}
      {observationImport.absence_method === 'sql_expression' && (
        <TextField
          label={formatMessage({
            id: 'absExpLb',
            defaultMessage: 'SQL-Ausdruck',
          })}
          name="absence_expression"
          value={observationImport.absence_expression ?? ''}
          onChange={onChange}
          validationState={validations?.absence_expression?.state}
          validationMessage={
            validations?.absence_expression?.message ??
            formatMessage({
              id: 'absExpVl',
              defaultMessage:
                "Ein SQL-Ausdruck, der pro Beobachtung true ergibt, wenn die Art nicht gefunden wurde. Bezieht sich auf die Daten der Zeile, z.B.: data->>'ANZAHL' = '0'",
            })
          }
        />
      )}
      <Set observationImport={observationImport} />
    </>
  )
}
