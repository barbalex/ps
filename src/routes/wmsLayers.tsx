import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'

import { useElectric } from '../ElectricProvider.tsx'
import {
  createWmsLayer,
  createLayerPresentation,
} from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { wmsLayersFilterAtom } from '../store.ts'
import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(wmsLayersFilterAtom)
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const where = filter.length > 1 ? { OR: filter } : filter[0]

  const { results: wmsLayers = [] } = useLiveQuery(
    db.wms_layers.liveMany({
      where: { project_id, ...where },
      orderBy: { label: 'asc' },
    }),
  )
  const { results: wmsLayersUnfiltered = [] } = useLiveQuery(
    db.wms_layers.liveMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered = wmsLayers.length !== wmsLayersUnfiltered.length

  const add = useCallback(async () => {
    const wmsLayer = createWmsLayer({ project_id })
    console.log('WmsLayers.add, wmsLayer:', wmsLayer)
    await db.wms_layers.create({ data: wmsLayer })
    // also add layer_presentation
    const layerPresentation = createLayerPresentation({
      wms_layer_id: wmsLayer.wms_layer_id,
    })
    await db.layer_presentations.create({ data: layerPresentation })
    navigate({
      pathname: wmsLayer.wms_layer_id,
      search: searchParams.toString(),
    })
  }, [
    db.layer_presentations,
    db.wms_layers,
    navigate,
    project_id,
    searchParams,
  ])

  return (
    <div className="list-view">
      <ListViewHeader
        title={`WMS Layers (${
          isFiltered
            ? `${wmsLayers.length}/${wmsLayersUnfiltered.length}`
            : wmsLayers.length
        })`}
        addRow={add}
        tableName="wms layer"
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {wmsLayers.map(({ wms_layer_id, label }) => (
          <Row
            key={wms_layer_id}
            to={wms_layer_id}
            label={label ?? wms_layer_id}
          />
        ))}
      </div>
    </div>
  )
})
