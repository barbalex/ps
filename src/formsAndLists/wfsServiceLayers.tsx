import { useParams } from '@tanstack/react-router'

import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useWfsServiceLayersNavData } from '../modules/useWfsServiceLayersNavData.ts'

import '../form.css'


export const WfsServiceLayers = () => {
  const { projectId, wfsServiceId } = useParams({ strict: false })

  const { loading, navData } = useWfsServiceLayersNavData({
    projectId: projectId!,    wfsServiceId: wfsServiceId!,  })
  const { navs, label } = navData

  return (
    <div className="list-view">
      <ListHeader label={label} nameSingular="WFS-Dienst-Ebene" />
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
