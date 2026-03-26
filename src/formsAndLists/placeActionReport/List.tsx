import { useParams } from '@tanstack/react-router'

import { usePlaceActionReportNavData } from '../../modules/usePlaceActionReportNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'
import { NotFound } from '../../components/NotFound.tsx'

export const PlaceActionReportList = ({ from }) => {
  const { projectId, subprojectId, placeId, placeId2, placeActionReportId } =
    useParams({ from })
  const { loading, navData } = usePlaceActionReportNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    placeActionReportId,
  })
  const { navs, notFound } = navData

  if (notFound) {
    return <NotFound table="Report" id={placeActionReportId} />
  }

  return (
    <div className="list-view">
      <Header from={from} />
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          navs.map((nav) => <Row key={nav.id} label={nav.label} to={nav.id} />)
        )}
      </div>
    </div>
  )
}
