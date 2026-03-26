import { useParams } from '@tanstack/react-router'

import { usePlaceCheckReportNavData } from '../../modules/usePlaceCheckReportNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'
import { NotFound } from '../../components/NotFound.tsx'

export const PlaceCheckReportList = ({ from }) => {
  const { projectId, subprojectId, placeId, placeId2, placeCheckReportId } =
    useParams({ from })
  const { loading, navData } = usePlaceCheckReportNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    placeCheckReportId,
  })
  const { navs, notFound } = navData

  if (notFound) {
    return (
      <NotFound
        table="Report"
        id={placeCheckReportId}
      />
    )
  }

  return (
    <div className="list-view">
      <Header from={from} />
      <div className="list-container">
        {loading ?
          <Loading />
        : navs.map((nav) => (
            <Row
              key={nav.id}
              label={nav.label}
              to={nav.id}
            />
          ))
        }
      </div>
    </div>
  )
}
