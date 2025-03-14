import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createCrs } from '../../modules/createRows.ts'
import { ListViewHeader } from '../../components/ListViewHeader/index.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { Info } from './Info.tsx'
import '../../form.css'

export const CRSS = memo(() => {
  const navigate = useNavigate()
  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `
    SELECT 
      crs_id, 
      label 
    FROM crs 
    ORDER BY label`,
    undefined,
    'crs_id',
  )
  const isLoading = res === undefined
  const crs = res?.rows ?? []

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
      <ListViewHeader
        namePlural="CRS: Coordinate Reference Systems"
        nameSingular="crs"
        tableName="crs"
        isFiltered={false}
        countFiltered={crs.length}
        isLoading={isLoading}
        addRow={add}
        info={<Info />}
      />
      <div className="list-container">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {crs.map((cr) => (
              <Row
                key={cr.crs_id}
                to={cr.crs_id}
                label={cr.label ?? cr.crs_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
