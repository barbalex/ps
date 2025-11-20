import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createCheckValue } from '../modules/createRows.ts'
import { useCheckValuesNavData } from '../modules/useCheckValuesNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const CheckValues = ({ from }) => {
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

  const add = async () => {
    const res = await createCheckValue({ checkId, db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.check_value_id,
      params: (prev) => ({ ...prev, checkValueId: data.check_value_id }),
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
