import { memo } from 'react'
import { useParams } from '@tanstack/react-router'

import { useActionReportNavData } from '../../modules/useActionReportNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'
import { NotFound } from '../../components/NotFound.tsx'

export const ActionReportList = memo(({ from }) => {
  const {
    projectId,
    subprojectId,
    placeId,
    placeId2,
    actionId,
    actionReportId,
  } = useParams({
    from,
  })
  const { loading, navData } = useActionReportNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    actionId,
    actionReportId,
  })
  const { navs, notFound } = navData

  if (notFound) {
    return (
      <NotFound
        table="Action Report"
        id={actionReportId}
      />
    )
  }

  return (
    <div className="list-view">
      <Header from={from} />
      <div className="list-container">
        {loading ?
          <Loading />
        : <>
            {navs.map((nav) => (
              <Row
                key={nav.id}
                label={nav.label}
                to={nav.id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
