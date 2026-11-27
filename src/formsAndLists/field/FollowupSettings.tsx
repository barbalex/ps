import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'
import type Fields from '../../models/public/Fields.ts'
import { DropdownFieldOptions } from '../../components/shared/DropdownFieldOptions.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { TextArea } from '../../components/shared/TextArea.tsx'
import type { ComponentProps } from 'react'

type Props = {
  row: Fields
  onChange: ComponentProps<typeof TextField>['onChange'] &
    ComponentProps<typeof DropdownFieldOptions>['onChange']
  validations: Record<
    string,
    | { state: 'error' | 'warning' | 'success' | 'none'; message: string }
    | undefined
  >
}

export function FollowupSettings({ row, onChange, validations }: Props) {
  const { formatMessage } = useIntl()
  const sources =
    useLiveQuery<{ value: string; label: string; type: string }>(
      `WITH RECURSIVE descendants(id) AS (
       SELECT $1::uuid UNION SELECT f.field_id FROM fields f JOIN descendants d ON f.followup_field_id=d.id
     )
     SELECT f.field_id AS value, coalesce(nullif(f.field_label,''), f.name) AS label, ft.name AS type
     FROM fields f JOIN field_types ft USING(field_type_id)
     WHERE f.table_name=$2 AND f.level IS NOT DISTINCT FROM $3::integer
       AND f.project_id IS NOT DISTINCT FROM $4::uuid AND f.account_id IS NOT DISTINCT FROM $5::uuid
       AND f.name IS NOT NULL AND f.field_id NOT IN (SELECT id FROM descendants)
       AND (NOT coalesce(f.obsolete,false) OR f.field_id=$6)
     ORDER BY label, f.field_id`,
      [
        row.field_id,
        row.table_name,
        row.level,
        row.project_id,
        row.account_id,
        row.followup_field_id,
      ],
    )?.rows ?? []
  const validation = (key: string) => ({
    validationState: validations[key]?.state,
    validationMessage: validations[key]?.message,
  })
  const answerLabel = formatMessage({
    id: 'followAnswer',
    defaultMessage: 'Erwartete Antwort',
  })
  return (
    <>
      <TextArea
        name="instructions"
        label={formatMessage({
          id: 'fieldInstructions',
          defaultMessage: 'Hinweise zur Eingabe',
        })}
        value={row.instructions ?? ''}
        onChange={onChange}
        {...validation('instructions')}
      />
      <DropdownFieldOptions
        name="followup_field_id"
        label={formatMessage({
          id: 'followSource',
          defaultMessage: 'Folgefrage abhängig von',
        })}
        options={sources}
        value={row.followup_field_id}
        onChange={onChange}
        {...validation('followup_field_id')}
      />
      {row.followup_field_id && (
        <>
          <DropdownFieldOptions
            name="followup_test"
            label={formatMessage({
              id: 'followWhen',
              defaultMessage: 'Feld anzeigen, wenn',
            })}
            options={[
              {
                value: 'answered',
                label: formatMessage({
                  id: 'followAnswered',
                  defaultMessage: 'Eine Antwort vorliegt',
                }),
              },
              {
                value: 'unanswered',
                label: formatMessage({
                  id: 'followUnanswered',
                  defaultMessage: 'Keine Antwort vorliegt',
                }),
              },
              {
                value: 'equals',
                label: formatMessage({
                  id: 'followEquals',
                  defaultMessage:
                    'Die Antwort einem bestimmten Wert entspricht',
                }),
              },
            ]}
            value={row.followup_test ?? 'answered'}
            onChange={onChange}
            {...validation('followup_test')}
          />
          {row.followup_test === 'equals' &&
            ((
              sources.find((s) => s.value === row.followup_field_id)?.type ===
              'boolean'
            ) ?
              <DropdownFieldOptions
                name="followup_answer"
                label={answerLabel}
                options={[
                  {
                    value: 'true',
                    label: formatMessage({
                      id: 'bCommonYes',
                      defaultMessage: 'Ja',
                    }),
                  },
                  {
                    value: 'false',
                    label: formatMessage({
                      id: 'bCommonNo',
                      defaultMessage: 'Nein',
                    }),
                  },
                ]}
                value={row.followup_answer}
                onChange={onChange}
                {...validation('followup_answer')}
              />
            : <TextField
                name="followup_answer"
                label={answerLabel}
                value={row.followup_answer ?? ''}
                onChange={onChange}
                {...validation('followup_answer')}
              />)}
        </>
      )}
    </>
  )
}
