import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createActionValue } from '../modules/createRows.ts'
import { useActionValuesNavData } from '../modules/useActionValuesNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const ActionValues = memo(({ from }) => {
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

  const add = useCallback(async () => {
    const res = await createActionValue({ db, actionId })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.action_value_id,
      params: (prev) => ({ ...prev, actionValueId: data.action_value_id }),
    })
  }, [actionId, db, navigate])

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
            {navs.map(({ action_value_id, label }) => (
              <Row
                key={action_value_id}
                label={label ?? action_value_id}
                to={action_value_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
