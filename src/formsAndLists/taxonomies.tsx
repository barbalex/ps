import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createTaxonomy } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from = '/data/_authLayout/projects/$projectId_/taxonomies/'

export const Taxonomies = memo(() => {
  const { projectId } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT taxonomy_id, label FROM taxonomies WHERE project_id = $1 ORDER BY label`,
    [projectId],
    'taxonomy_id',
  )
  const isLoading = res === undefined
  const taxonomies = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createTaxonomy({ db, projectId })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.taxonomy_id,
      params: (prev) => ({ ...prev, taxonomyId: data.taxonomy_id }),
    })
  }, [db, navigate, projectId])

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
        {isLoading ?
          <Loading />
        : <>
            {taxonomies.map(({ taxonomy_id, label }) => (
              <Row
                key={taxonomy_id}
                label={label ?? taxonomy_id}
                to={taxonomy_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
