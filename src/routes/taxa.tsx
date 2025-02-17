import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createTaxon } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  const { taxonomy_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const result = useLiveQuery(
    `SELECT * FROM taxa WHERE taxonomy_id = $1 order by label asc`,
    [taxonomy_id],
  )
  const taxa = result.rows ?? []

  const add = useCallback(async () => {
    const res = await createTaxon({ taxonomy_id, db })
    const taxon = res.rows[0]
    navigate({ pathname: taxon.taxon_id, search: searchParams.toString() })
  }, [db, navigate, searchParams, taxonomy_id])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Taxa"
        nameSingular="Taxon"
        tableName="taxa"
        isFiltered={false}
        countFiltered={taxa.length}
        addRow={add}
      />
      <div className="list-container">
        {taxa.map(({ taxon_id, label }) => (
          <Row key={taxon_id} label={label ?? taxon_id} to={taxon_id} />
        ))}
      </div>
    </div>
  )
})
