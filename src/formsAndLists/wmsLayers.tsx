import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

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
  const db = usePGlite()

  const { loading, navData, isFiltered } = useWmsLayersNavData({ projectId })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const wmsLayer = await createWmsLayer({ projectId, db })
    if (!wmsLayer) return
    // also add layer_presentation
    await createLayerPresentation({
      wmsLayerId: wmsLayer.wms_layer_id,
      db,
    })
    navigate({
      to: wmsLayer.wms_layer_id,
      params: (prev) => ({ ...prev, wmsLayerId: wmsLayer.wms_layer_id }),
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
        : <>
            {navs.map(({ id, label }) => (
              <Row
                key={id}
                to={id}
                label={label ?? id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
}
