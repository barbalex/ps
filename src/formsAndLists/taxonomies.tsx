import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createTaxonomy } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const Component = memo(() => {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT taxonomy_id, label FROM taxonomies WHERE project_id = $1 ORDER BY label`,
    [project_id],
    'taxonomy_id',
  )
  const isLoading = res === undefined
  const taxonomies = res?.rows ?? []

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
        isLoading={isLoading}
        addRow={add}
      />
      <div className="list-container">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {taxonomies.map(({ taxonomy_id, label }) => (
              <Row
                key={taxonomy_id}
                label={label ?? taxonomy_id}
                to={taxonomy_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
