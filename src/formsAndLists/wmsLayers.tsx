import { useCallback, memo } from 'react'
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

const from = '/data/_authLayout/projects/$projectId_/wms-layers/'

export const WmsLayers = memo(() => {
  const { projectId } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData, isFiltered } = useWmsLayersNavData({ projectId })
  const { navs, label, nameSingular } = navData

  const add = useCallback(async () => {
    const res = await createWmsLayer({ projectId, db })
    const data = res?.rows?.[0]
    if (!data) return
    // also add layer_presentation
    await createLayerPresentation({
      wmsLayerId: data.wms_layer_id,
      db,
    })
    navigate({
      to: data.wms_layer_id,
      params: (prev) => ({ ...prev, wmsLayerId: data.wms_layer_id }),
    })
  }, [db, navigate, projectId])

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
            {navs.map(({ wms_layer_id, label }) => (
              <Row
                key={wms_layer_id}
                to={wms_layer_id}
                label={label ?? wms_layer_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
