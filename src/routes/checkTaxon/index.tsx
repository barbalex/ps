import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading'

import '../../form.css'

export const Component = () => {
  const { check_taxon_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.check_taxa.liveUnique({ where: { check_taxon_id } }),
  )

  // console.log('CheckTaxon', { row, results })

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.check_taxa.update({
        where: { check_taxon_id },
        data: { [name]: value },
      })
    },
    [db.check_taxa, check_taxon_id],
  )

  if (!row) return <Loading />

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="check_taxon_id"
          value={row.check_taxon_id ?? ''}
        />
        <DropdownField
          label="Taxon"
          name="taxon_id"
          table="taxa"
          value={row.taxon_id ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <TextField
          label="Value (integer)"
          name="value_integer"
          type="number"
          value={row.value_integer ?? ''}
          onChange={onChange}
        />
        <TextField
          label="Value (numeric)"
          name="value_numeric"
          type="number"
          value={row.value_numeric ?? ''}
          onChange={onChange}
        />
        <TextField
          label="Value (text)"
          name="value_text"
          value={row.value_text ?? ''}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
