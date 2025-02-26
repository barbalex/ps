import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createCheckTaxon } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  const { check_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const results = useLiveQuery(
    `SELECT * FROM check_taxa WHERE check_id = $1 ORDER BY label ASC`,
    [check_id],
  )
  const checkTaxa = results?.rows ?? []

  const add = useCallback(async () => {
    const res = await createCheckTaxon({ db, check_id })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      pathname: data.check_taxon_id,
      search: searchParams.toString(),
    })
  }, [check_id, db, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Check Taxa"
        nameSingular="Check Taxon"
        tableName="check_taxa"
        isFiltered={false}
        countFiltered={checkTaxa.length}
        addRow={add}
      />
      <div className="list-container">
        {checkTaxa.map(({ check_taxon_id, label }) => (
          <Row
            key={check_taxon_id}
            label={label ?? check_taxon_id}
            to={check_taxon_id}
          />
        ))}
      </div>
    </div>
  )
})
