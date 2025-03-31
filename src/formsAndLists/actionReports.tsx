import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createActionReport } from '../modules/createRows.ts'
import { useActionReportsNavData } from '../modules/useActionReportsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const ActionReports = memo(({ from }) => {
  const { projectId, subprojectId, placeId, placeId2, actionId } = useParams({
    from,
  })
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData } = useActionReportsNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    actionId,
  })
  const { navs, label, nameSingular } = navData

  const add = useCallback(async () => {
    const res = await createActionReport({ db, projectId, actionId })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.action_report_id,
      params: (prev) => ({ ...prev, actionReportId: data.action_report_id }),
    })
  }, [actionId, db, navigate, projectId])

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
                label={label}
                to={id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
