import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createCrs } from '../../modules/createRows.ts'
import { useCrssNavData } from '../../modules/useCrssNavData.ts'
import { ListHeader } from '../../components/ListHeader.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { Info } from './Info.tsx'
import '../../form.css'

export const CRSS = memo(() => {
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData } = useCrssNavData()
  const { navs, label, nameSingular } = navData

  const add = useCallback(async () => {
    const res = await createCrs({ db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: `/data/crs/${data.crs_id}`,
      params: (prev) => ({ ...prev, crsId: data.crs_id }),
    })
  }, [db, navigate])

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        info={<Info />}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : <>
            {navs.map((cr) => (
              <Row
                key={cr.crs_id}
                to={cr.crs_id}
                label={cr.label ?? cr.crs_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
