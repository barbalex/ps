import { useCallback, useRef, memo } from 'react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { ComboboxFilteringForTable } from '../../components/shared/ComboboxFilteringForTable/index.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'

import '../../form.css'

// TODO: what was this for?
const taxaInclude = { taxonomies: true }

export const Component = memo(() => {
  const { subproject_taxon_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT * FROM subproject_taxa WHERE subproject_taxon_id = $1`,
    [subproject_taxon_id],
    'subproject_taxon_id',
  )
  const row = res?.rows?.[0]

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      // only change if value has changed: maybe only focus entered and left
      if (row[name] === value) return

      db.query(
        `UPDATE subproject_taxa SET ${name} = $1 WHERE subproject_taxon_id = $2`,
        [value, subproject_taxon_id],
      )
    },
    [db, row, subproject_taxon_id],
  )

  if (!row) return <Loading />

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
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
