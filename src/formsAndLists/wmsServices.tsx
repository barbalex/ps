import { useParams } from '@tanstack/react-router'

import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useWmsServicesNavData } from '../modules/useWmsServicesNavData.ts'
import '../form.css'

const from = '/data/projects/$projectId_/wms-services/'

export const WmsServices = () => {
  const { projectId } = useParams({ from })

  const { loading, navData } = useWmsServicesNavData({ projectId })
  const { navs, label } = navData

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular="WMS Service"
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
