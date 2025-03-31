import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createCheckTaxon } from '../modules/createRows.ts'
import { useCheckTaxaNavData } from '../modules/useCheckTaxaNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const CheckTaxa = memo(({ from }) => {
  const { projectId, subprojectId, placeId, placeId2, checkId } = useParams({
    from,
  })
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData } = useCheckTaxaNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    checkId,
  })
  const { navs, label, nameSingular } = navData

  const add = useCallback(async () => {
    const res = await createCheckTaxon({ db, checkId })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.check_taxon_id,
      params: (prev) => ({ ...prev, checkTaxonId: data.check_taxon_id }),
    })
  }, [checkId, db, navigate])

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
})
