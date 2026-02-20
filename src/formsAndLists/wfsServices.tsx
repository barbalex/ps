import { useParams, useNavigate } from '@tanstack/react-router'

import { createWfsService } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useWfsServicesNavData } from '../modules/useWfsServicesNavData.ts'
import '../form.css'

const from = '/data/projects/$projectId_/wfs-services/'

export const WfsServices = () => {
  const { projectId } = useParams({ from })
  const navigate = useNavigate()

  const { loading, navData, isFiltered } = useWfsServicesNavData({ projectId })
  const { navs, label } = navData

  const add = async () => {
    const data = await createWfsService({ projectId })
    if (!data) return
    const id = data.wfs_service_id
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
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          navs.map(({ id, label }) => (
            <Row key={id} to={id} label={label ?? id} />
          ))
        )}
      </div>
    </div>
  )
}
