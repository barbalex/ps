import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createTaxonomy } from '../modules/createRows.ts'
import { useTaxonomiesNavData } from '../modules/useTaxonomiesNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from = '/data/_authLayout/projects/$projectId_/taxonomies/'

export const Taxonomies = memo(() => {
  const { projectId } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData } = useTaxonomiesNavData({ projectId })
  const { navs, label, nameSingular } = navData

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
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : <>
            {navs.map(({ taxonomy_id, label }) => (
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
