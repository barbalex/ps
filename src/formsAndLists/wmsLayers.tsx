import { useParams, useNavigate } from '@tanstack/react-router'

import {
  createWmsLayer,
  createLayerPresentation,
} from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useWmsLayersNavData } from '../modules/useWmsLayersNavData.ts'
import '../form.css'

const from = '/data/projects/$projectId_/wms-layers/'

export const WmsLayers = () => {
  const { projectId } = useParams({ from })
  const navigate = useNavigate()

  const { loading, navData, isFiltered } = useWmsLayersNavData({ projectId })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const wmsLayerId = await createWmsLayer({ projectId })
    if (!wmsLayerId) return
    // also add layer_presentation
    await createLayerPresentation({
      wmsLayerId,
    })
    await navigate({
      to: '/data/projects/$projectId_/wms-layers/$wmsLayerId',
      params: { projectId, wmsLayerId },
    })
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
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
