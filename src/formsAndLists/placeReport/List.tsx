import { memo } from 'react'
import { useParams } from '@tanstack/react-router'

import { usePlaceReportNavData } from '../../modules/usePlaceReportNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'

export const PlaceReportList = memo(({ from }) => {
  const { projectId, subprojectId, placeId, placeId2, placeReportId } =
    useParams({ from })
  const { loading, navData } = usePlaceReportNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    placeReportId,
  })
  const { navs } = navData

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
