import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createCheckValue } from '../modules/createRows.ts'
import { useCheckValuesNavData } from '../modules/useCheckValuesNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const CheckValues = memo(({ from }) => {
  const { projectId, subprojectId, placeId, placeId2, checkId } = useParams({
    from,
  })
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData } = useCheckValuesNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    checkId,
  })
  const { navs, label, nameSingular } = navData

  const add = useCallback(async () => {
    const res = await createCheckValue({ checkId, db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.check_value_id,
      params: (prev) => ({ ...prev, checkValueId: data.check_value_id }),
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
            {navs.map(({ check_value_id, label }) => (
              <Row
                key={check_value_id}
                label={label ?? check_value_id}
                to={check_value_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
