import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createTaxon } from '../modules/createRows.ts'
import { useTaxaNavData } from '../modules/useTaxaNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from = '/data/projects/$projectId_/taxonomies/$taxonomyId_/taxa/'

export const Taxa = () => {
  const { projectId, taxonomyId } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData } = useTaxaNavData({
    projectId,
    taxonomyId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const res = await createTaxon({ taxonomyId, db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.taxon_id,
      params: (prev) => ({ ...prev, taxonId: data.taxon_id }),
    })
  }

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
            {navs.map(({ id, label }) => (
              <Row
                key={id}
                label={label ?? id}
                to={id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
}
