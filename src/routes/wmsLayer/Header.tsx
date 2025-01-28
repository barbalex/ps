import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import {
  createWmsLayer,
  createLayerPresentation,
} from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, wms_layer_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const wmsLayer = createWmsLayer({ project_id })
    await db.wms_layers.create({ data: wmsLayer })
    // also add layer_presentation
    const layerPresentation = createLayerPresentation({
      wms_layer_id: wmsLayer.wms_layer_id,
    })
    await db.layer_presentations.create({ data: layerPresentation })
    navigate({
      pathname: `../${wmsLayer.wms_layer_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [
    autoFocusRef,
    db.layer_presentations,
    db.wms_layers,
    navigate,
    project_id,
    searchParams,
  ])

  const deleteRow = useCallback(async () => {
    await db.wms_layers.delete({ where: { wms_layer_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.wms_layers, navigate, wms_layer_id, searchParams])

  const toNext = useCallback(async () => {
    const wmsLayers = await db.wms_layers.findMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    })
    const len = wmsLayers.length
    const index = wmsLayers.findIndex((p) => p.wms_layer_id === wms_layer_id)
    const next = wmsLayers[(index + 1) % len]
    navigate({
      pathname: `../${next.wms_layer_id}`,
      search: searchParams.toString(),
    })
  }, [db.wms_layers, navigate, project_id, wms_layer_id, searchParams])

  const toPrevious = useCallback(async () => {
    const wmsLayers = await db.wms_layers.findMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    })
    const len = wmsLayers.length
    const index = wmsLayers.findIndex((p) => p.wms_layer_id === wms_layer_id)
    const previous = wmsLayers[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.wms_layer_id}`,
      search: searchParams.toString(),
    })
  }, [db.wms_layers, navigate, project_id, wms_layer_id, searchParams])

  return (
    <FormHeader
      title="WMS Layer"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="wms layer"
    />
  )
})
