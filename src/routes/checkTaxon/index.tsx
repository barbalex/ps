import { useCallback, useMemo, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { CheckTaxa as CheckTaxon } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { DropdownField } from '../../components/shared/DropdownField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { Header } from './Header'

import '../../form.css'

export const Component = () => {
  const { check_taxon_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.check_taxa.liveUnique({ where: { check_taxon_id } }),
  )

  const row: CheckTaxon = results

  const taxaWhere = useMemo(() => ({ deleted: false }), [])

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

  if (!row) {
    return <div>Loading...</div>
  }

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
          where={taxaWhere}
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
