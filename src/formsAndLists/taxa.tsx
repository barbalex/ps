import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createTaxon } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from =
  '/data/_authLayout/projects/$projectId_/taxonomies/$taxonomyId_/taxa/'

export const Taxa = memo(() => {
  const { taxonomyId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT taxon_id, label FROM taxa WHERE taxonomy_id = $1 ORDER BY label`,
    [taxonomyId],
    'taxon_id',
  )
  const isLoading = res === undefined
  const taxa = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createTaxon({ taxonomyId, db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.taxon_id,
      params: (prev) => ({ ...prev, taxonId: data.taxon_id }),
    })
  }, [db, navigate, taxonomyId])

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
        {isLoading ?
          <Loading />
        : <>
            {taxa.map(({ taxon_id, label }) => (
              <Row
                key={taxon_id}
                label={label ?? taxon_id}
                to={taxon_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
