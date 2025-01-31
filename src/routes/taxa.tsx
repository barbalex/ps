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
  const { results: taxa = [] } = useLiveQuery(
    db.taxa.liveMany({
      where: { taxonomy_id },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const taxon = createTaxon()
    await db.taxa.create({
      data: {
        ...taxon,
        taxonomy_id,
      },
    })
    navigate({ pathname: taxon.taxon_id, search: searchParams.toString() })
  }, [db.taxa, navigate, searchParams, taxonomy_id])

  return (
    <div className="list-view">
      <ListViewHeader
        title="Taxa"
        addRow={add}
        tableName="taxon"
      />
      <div className="list-container">
        {taxa.map(({ taxon_id, label }) => (
          <Row
            key={taxon_id}
            label={label ?? taxon_id}
            to={taxon_id}
          />
        ))}
      </div>
    </div>
  )
})
