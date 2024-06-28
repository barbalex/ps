import { memo, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { TextArea } from '../../components/shared/TextArea.tsx'
import { ComboboxFilteringOptions } from './Combobox/index.tsx'

import { Loading } from '../../components/shared/Loading.tsx'

import '../../form.css'

// this form is rendered from a parent or outlet
export const Component = memo(({ autoFocusRef }) => {
  const { crs_id } = useParams()

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.crs.liveUnique({ where: { crs_id } }),
  )

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.crs.update({
        where: { crs_id },
        data: { [name]: value },
      })
    },
    [db.crs, crs_id],
  )

  if (!row) return <Loading />

  return (
    <>
      <ComboboxFilteringOptions autoFocus={!row.code} ref={autoFocusRef} />
      <TextField
        label="Code"
        name="code"
        type="code"
        value={row.code ?? ''}
        onChange={onChange}
      />
      <TextField
        label="Name"
        name="name"
        type="name"
        value={row.name ?? ''}
        onChange={onChange}
      />
      <TextArea
        label="Proj4 Value"
        name="proj4"
        type="proj4"
        value={row.proj4 ?? ''}
        onChange={onChange}
      />
    </>
  )
})
