import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createActionValue } from '../modules/createRows.ts'
import { useActionValuesNavData } from '../modules/useActionValuesNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const ActionValues = ({ from }) => {
  const { projectId, subprojectId, placeId, placeId2, actionId } = useParams({
    from,
  })
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData } = useActionValuesNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    actionId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const res = await createActionValue({ db, actionId })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.action_value_id,
      params: (prev) => ({ ...prev, actionValueId: data.action_value_id }),
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
