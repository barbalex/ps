import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createTaxonomy } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const result = useLiveQuery(
    `SELECT * FROM taxonomies WHERE project_id = $1 ORDER BY label ASC`,
    [project_id],
  )
  const taxonomies = result?.rows ?? []

  const add = useCallback(async () => {
    const data = await createTaxonomy({ db, project_id })
    const columns = Object.keys(data).join(',')
    const values = Object.values(data)
    const sql = `INSERT INTO taxonomies (${columns}) VALUES (${values
      .map((_, i) => `$${i + 1}`)
      .join(',')})`
    await db.query(sql, values)
    navigate({ pathname: data.taxonomy_id, search: searchParams.toString() })
  }, [db, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Taxonomies"
        nameSingular="Taxonomy"
        tableName="taxonomies"
        isFiltered={false}
        countFiltered={taxonomies.length}
        addRow={add}
      />
      <div className="list-container">
        {taxonomies.map(({ taxonomy_id, label }) => (
          <Row
            key={taxonomy_id}
            label={label ?? taxonomy_id}
            to={taxonomy_id}
          />
        ))}
      </div>
    </div>
  )
})
