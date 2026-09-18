import { useParams } from '@tanstack/react-router'

import { useWmsServiceNavData } from '../../modules/useWmsServiceNavData.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Header } from './Header.tsx'
import { NotFound } from '../../components/NotFound.tsx'

export const WmsServiceList = ({ from }: { from: string }) => {
  const { projectId, wmsServiceId } = useParams({ strict: false })
  const { loading, navData } = useWmsServiceNavData({
    projectId: projectId!,
    wmsServiceId: wmsServiceId!,
  })
 const { navs, label, notFound } = navData

  if (notFound) {
    return (
      <NotFound
        table="WMS Service"
        id={wmsServiceId}
      />
    )
  }

  return (
    <div className="list-view">
      <Header
        from={from}
        label={label}
      />
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
