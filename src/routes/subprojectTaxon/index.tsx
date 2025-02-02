import { useCallback, useRef, memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite } from '@electric-sql/pglite-react'

import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'
import { ComboboxFilteringForTable } from '../../components/shared/ComboboxFilteringForTable/index.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'

import '../../form.css'

const taxaInclude = { taxonomies: true }

export const Component = memo(() => {
  const { subproject_taxon_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const { results: row } = useLiveQuery(
    db.subproject_taxa.liveUnique({ where: { subproject_taxon_id } }),
  )

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.subproject_taxa.update({
        where: { subproject_taxon_id },
        data: { [name]: value },
      })
    },
    [db.subproject_taxa, subproject_taxon_id],
  )

  if (!row) return <Loading />

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="subproject_taxon_id"
          value={row.subproject_taxon_id}
        />
        <ComboboxFilteringForTable
          label="Taxon"
          name="taxon_id"
          table="taxa"
          include={taxaInclude}
          value={row.taxon_id ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
      </div>
    </div>
  )
})
