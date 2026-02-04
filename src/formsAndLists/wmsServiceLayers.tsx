import { useParams } from '@tanstack/react-router'

import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useWmsServiceLayersNavData } from '../modules/useWmsServiceLayersNavData.ts'
import '../form.css'

const from = '/data/projects/$projectId_/wms-services/$wmsServiceId/layers/'

export const WmsServiceLayers = () => {
  const { projectId, wmsServiceId } = useParams({ from })

  const { loading, navData } = useWmsServiceLayersNavData({ projectId, wmsServiceId })
  const { navs, label } = navData

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular="WMS Service Layer"
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : navs.map(({ id, label }) => (
            <Row
              key={id}
              to={id}
              label={label ?? id}
            />
          ))
        }
      </div>
    </div>
  )
}
