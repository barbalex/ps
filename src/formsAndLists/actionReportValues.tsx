import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createActionReportValue } from '../modules/createRows.ts'
import { useActionReportValuesNavData } from '../modules/useActionReportValuesNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const ActionReportValues = ({ from }) => {
  const {
    projectId,
    subprojectId,
    placeId,
    placeId2,
    actionId,
    actionReportId,
  } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData } = useActionReportValuesNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    actionId,
    actionReportId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const res = await createActionReportValue({ db, actionReportId })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.action_report_value_id,
      params: (prev) => ({
        ...prev,
        actionReportValueId: data.action_report_value_id,
      }),
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
                navigateTo={id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
}
