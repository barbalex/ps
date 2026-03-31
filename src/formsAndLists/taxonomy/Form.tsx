import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { Type } from './Type.tsx'
import type Taxonomies from '../../models/public/Taxonomies.ts'

import '../../form.css'

type Props = {
  row: Taxonomies
  onChange: (e: React.ChangeEvent<unknown>, data?: unknown) => Promise<void>
  validations?: Record<string, { state: string; message: string }>
  autoFocusRef?: React.Ref<HTMLInputElement>
  projectId: string
}

export const TaxonomyForm = ({
  row,
  onChange,
  validations,
  autoFocusRef,
  projectId,
}: Props) => {
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
      <Type row={row} onChange={onChange} validations={validations} />
      <DropdownField
        label={formatMessage({ id: 'bDkNqO', defaultMessage: 'Einheit' })}
        name="unit_id"
        table="units"
        idField="unit_id"
        where={`project_id = '${projectId}'`}
        value={row.unit_id ?? ''}
        onChange={onChange}
        validationState={validations?.unit_id?.state}
        validationMessage={
          validations?.unit_id?.message ??
          formatMessage({
            id: 'vU6WxY',
            defaultMessage:
              'Hilft bei der Analyse von Daten in Berichten. Beispiele: «Abundanzklasse», «Deckung». Wenn keine Einheit gesetzt ist, wird angenommen, dass die Taxonomie nur Präsenz beschreibt.',
          })
        }
      />
      <TextField
        label={formatMessage({ id: 'TpzCEx', defaultMessage: 'Url' })}
        name="url"
        type="url"
        value={row.url ?? ''}
        onChange={onChange}
        validationState={validations?.url?.state}
        validationMessage={validations?.url?.message}
      />
      <Jsonb
        table="taxonomies"
        idField="taxonomy_id"
        id={row.taxonomy_id}
        data={row.data ?? {}}
      />
      <SwitchField
        label={formatMessage({ id: 'Ob2kQz', defaultMessage: 'Obsolet' })}
        name="obsolete"
        value={row.obsolete ?? false}
        onChange={onChange}
        validationState={validations?.obsolete?.state}
        validationMessage={validations?.obsolete?.message}
      />
    </>
  )
}
