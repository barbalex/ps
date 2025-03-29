import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createSubprojectTaxon } from '../modules/createRows.ts'
import { useSubprojectTaxaNavData } from '../modules/useSubprojectTaxaNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const SubprojectTaxa = memo(({ from }) => {
  const { projectId, subprojectId } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData } = useSubprojectTaxaNavData({
    projectId,
    subprojectId,
  })
  const { navs, label, nameSingular } = navData

  const add = useCallback(async () => {
    const res = await createSubprojectTaxon({ subprojectId, db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.subproject_taxon_id,
      params: (prev) => ({
        ...prev,
        subprojectTaxonId: data.subproject_taxon_id,
      }),
    })
  }, [db, navigate, subprojectId])

  return (
    <div className="list-view">
      <ListHeader label={label} nameSingular={nameSingular} addRow={add} />
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          <>
            {navs.map(({ subproject_taxon_id, label }) => (
              <Row
                key={subproject_taxon_id}
                to={subproject_taxon_id}
                label={label ?? subproject_taxon_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
