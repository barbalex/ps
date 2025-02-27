import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createTaxonomy } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const result = useLiveIncrementalQuery(
    `SELECT taxonomy_id, label FROM taxonomies WHERE project_id = $1 ORDER BY label ASC`,
    [project_id],
    'taxonomy_id',
  )
  const taxonomies = result?.rows ?? []

  const add = useCallback(async () => {
    const res = await createTaxonomy({ db, project_id })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      pathname: data.taxonomy_id,
      search: searchParams.toString(),
    })
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
