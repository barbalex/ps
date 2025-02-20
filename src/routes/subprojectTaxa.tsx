import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createSubprojectTaxon } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  const { subproject_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const result = useLiveQuery(
    `SELECT * FROM subproject_taxa WHERE subproject_id = $1 ORDER BY label ASC`,
    [subproject_id],
  )
  const subprojectTaxa = result?.rows ?? []

  const add = useCallback(async () => {
    const res = await createSubprojectTaxon({ subproject_id, db })
    const data = res.rows[0]
    navigate({
      pathname: data.subproject_taxon_id,
      search: searchParams.toString(),
    })
  }, [db, navigate, searchParams, subproject_id])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Subproject Taxa"
        nameSingular="Subproject Taxon"
        tableName="subproject_taxa"
        isFiltered={false}
        countFiltered={subprojectTaxa.length}
        addRow={add}
      />
      <div className="list-container">
        {subprojectTaxa.map(({ subproject_taxon_id, label }) => (
          <Row
            key={subproject_taxon_id}
            to={subproject_taxon_id}
            label={label ?? subproject_taxon_id}
          />
        ))}
      </div>
    </div>
  )
})
