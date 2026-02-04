import { useParams } from '@tanstack/react-router'

import { useChartNavData } from '../../modules/useChartNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'
import { NotFound } from '../../components/NotFound.tsx'

export const ChartList = ({ from }) => {
  const { projectId, subprojectId, chartId } = useParams({
    from,
  })
  const { loading, navData } = useChartNavData({
    projectId,
    subprojectId,
    chartId,
  })
  const { navs, notFound } = navData

  if (notFound) {
    return (
      <NotFound
        table="Chart"
        id={chartId}
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
              label={nav.label ?? nav.id}
              to={nav.id}
            />
          ))
        }
      </div>
    </div>
  )
}
