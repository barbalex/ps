import { useCallback, useMemo, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { SubprojectTaxa as SubprojectTaxon } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { FilteringCombobox } from '../../components/shared/FilteringCombobox'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { Header } from './Header'

import '../../form.css'

export const Component = () => {
  const { subproject_taxon_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.subproject_taxa.liveUnique({ where: { subproject_taxon_id } }),
  )

  const row: SubprojectTaxon = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.subproject_taxa.update({
        where: { subproject_taxon_id },
        data: { [name]: value },
      })
    },
    [db.subproject_taxa, subproject_taxon_id],
  )

  const taxaWhere = useMemo(() => ({ deleted: false }), [])
  const taxaInclude = useMemo(() => ({ taxonomies: true }), [])

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="subproject_taxon_id"
          value={row.subproject_taxon_id}
        />
        <FilteringCombobox
          label="Taxon"
          name="taxon_id"
          table="taxa"
          where={taxaWhere}
          include={taxaInclude}
          value={row.taxon_id ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
      </div>
    </div>
  )
}
