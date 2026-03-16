import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'
import { useIntl } from 'react-intl'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'
import type Lists from '../../models/public/Lists.ts'

import '../../form.css'

type Props = {
  onChange: (e: React.ChangeEvent<unknown>, data?: unknown) => Promise<void>
  validations?: Record<string, { state: string; message: string }>
  row: Lists & { value_type?: string | null }
  orIndex?: number
  autoFocusRef?: React.Ref<HTMLInputElement>
}

// this form is rendered from a parent or outlet
export const ListForm = ({
  onChange,
  validations,
  row,
  orIndex,
  autoFocusRef,
}: Props) => {
  const { formatMessage } = useIntl()
  const isFirstRender = useIsFirstRender()
  const listValueTypesQuery = useLiveQuery(
    `SELECT type FROM list_value_types ORDER BY sort, type`,
  )
  const isListValueTypesLoading =
    isFirstRender && listValueTypesQuery === undefined
  const listValueTypes = listValueTypesQuery?.rows?.map((r) => r.type) ?? []

  // need to extract the jsonb data from the row
  // as inside filters it's name is a path
  // instead of it being inside of the data field
  const jsonbData = jsonbDataFromRow(row)

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
      <RadioGroupField
        label={formatMessage({ id: 'lVr8Zn', defaultMessage: 'Werttyp' })}
        name="value_type"
        list={listValueTypes}
        isLoading={isListValueTypesLoading}
        value={row.value_type ?? ''}
        onChange={onChange}
        validationState={validations?.value_type?.state}
        validationMessage={validations?.value_type?.message}
        replaceUnderscoreInLabel
      />
      <Jsonb
        table="lists"
        idField="list_id"
        id={row.list_id}
        data={jsonbData}
        orIndex={orIndex}
      />
      <SwitchField
        label={formatMessage({ id: 'Ob2kQz', defaultMessage: 'Obsolet' })}
        name="obsolete"
        value={row.obsolete}
        onChange={onChange}
        validationState={validations?.obsolete?.state}
        validationMessage={validations?.obsolete?.message}
      />
    </>
  )
}
