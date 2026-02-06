import { useParams, useNavigate } from '@tanstack/react-router'

import { createWfsService } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useWfsServicesNavData } from '../modules/useWfsServicesNavData.ts'
import '../form.css'

const from = '/data/projects/$projectId_/wfs-services/'

export const WfsServices = () => {
  const { projectId } = useParams({ from })
  const navigate = useNavigate()

  const { loading, navData } = useWfsServicesNavData({ projectId })
  const { navs, label } = navData

  const add = async () => {
    const id = await createWfsService({ projectId })
    if (!id) return
    navigate({
      to: `${id}/wfs-service`,
      params: (prev) => ({ ...prev, wfsServiceId: id }),
    })
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular="WFS Service"
        addRow={add}
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
