import { useParams } from '@tanstack/react-router'

import { useCheckReportNavData } from '../../modules/useCheckReportNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'
import { NotFound } from '../../components/NotFound.tsx'

export const CheckReportList = ({ from }: { from: string }) => {
  const { projectId, subprojectId, placeId, placeId2, checkReportId } =
    useParams({ strict: false })
  const { loading, navData } = useCheckReportNavData({
    projectId: projectId!,
    subprojectId: subprojectId!,
    placeId: placeId!,
    placeId2,
    checkReportId: checkReportId!,
  })
  const { navs, notFound } = navData

  if (notFound) {
    return (
      <NotFound
        table="Report"
        id={checkReportId}
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
