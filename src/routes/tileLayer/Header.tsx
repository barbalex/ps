import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import {
  createTileLayer,
  createLayerPresentation,
} from '../../modules/createRows.ts'
import { useElectric } from '../../ElectricProvider.tsx'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, tile_layer_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const tileLayer = createTileLayer({ project_id })
    await db.tile_layers.create({ data: tileLayer })
    // also add layer_presentation
    const layerPresentation = createLayerPresentation({
      layer_id: tileLayer.tile_layer_id,
    })
    await db.layer_presentations.create({ data: layerPresentation })
    navigate({
      pathname: `../${tileLayer.tile_layer_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [
    autoFocusRef,
    db.layer_presentations,
    db.tile_layers,
    navigate,
    project_id,
    searchParams,
  ])

  const deleteRow = useCallback(async () => {
    await db.tile_layers.delete({ where: { tile_layer_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.tile_layers, navigate, tile_layer_id, searchParams])

  const toNext = useCallback(async () => {
    const tileLayers = await db.tile_layers.findMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    })
    const len = tileLayers.length
    const index = tileLayers.findIndex((p) => p.tile_layer_id === tile_layer_id)
    const next = tileLayers[(index + 1) % len]
    navigate({
      pathname: `../${next.tile_layer_id}`,
      search: searchParams.toString(),
    })
  }, [db.tile_layers, navigate, project_id, tile_layer_id, searchParams])

  const toPrevious = useCallback(async () => {
    const tileLayers = await db.tile_layers.findMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    })
    const len = tileLayers.length
    const index = tileLayers.findIndex((p) => p.tile_layer_id === tile_layer_id)
    const previous = tileLayers[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.tile_layer_id}`,
      search: searchParams.toString(),
    })
  }, [db.tile_layers, navigate, project_id, tile_layer_id, searchParams])

  return (
    <FormHeader
      title="Tile Layer"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="tile layer"
    />
  )
})
