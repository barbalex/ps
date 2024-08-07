import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider.tsx'
import {
  createWmsLayer,
  createLayerPresentation,
} from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import '../form.css'

export const Component = memo(() => {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  const filter = useMemo(
    () =>
      appState?.filter_wms_layers?.filter((f) => Object.keys(f).length > 0) ??
      [],
    [appState?.filter_wms_layers],
  )
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
        menus={
          <FilterButton table="wms_layers" filterField="filter_wms_layers" />
        }
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
