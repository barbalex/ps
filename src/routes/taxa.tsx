import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createTaxon } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const Component = memo(() => {
  const { taxonomy_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT taxon_id, label FROM taxa WHERE taxonomy_id = $1 order by label asc`,
    [taxonomy_id],
    'taxon_id',
  )
  const isLoading = res === undefined
  const taxa = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createTaxon({ taxonomy_id, db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({ pathname: data.taxon_id, search: searchParams.toString() })
  }, [db, navigate, searchParams, taxonomy_id])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Taxa"
        nameSingular="Taxon"
        tableName="taxa"
        isFiltered={false}
        countFiltered={taxa.length}
        isLoading={isLoading}
        addRow={add}
      />
      <div className="list-container">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {taxa.map(({ taxon_id, label }) => (
              <Row
                key={taxon_id}
                label={label ?? taxon_id}
                to={taxon_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
