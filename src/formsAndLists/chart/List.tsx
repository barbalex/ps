import { memo } from 'react'
import { useParams } from '@tanstack/react-router'

import { useChartNavData } from '../../modules/useChartNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'

export const ChartList = memo(({ from }) => {
  const { projectId, subprojectId, chartId } = useParams({
    from,
  })
  const { loading, navData } = useChartNavData({
    projectId,
    subprojectId,
    chartId
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
