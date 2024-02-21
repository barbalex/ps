import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createTileLayer } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, tile_layer_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const baseUrl = `/projects/${project_id}/tile-layers`

  const addRow = useCallback(async () => {
    const tileLayer = createTileLayer({ project_id })
    await db.tile_layers.create({ data: tileLayer })
    navigate(`${baseUrl}/${tileLayer.tile_layer_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, baseUrl, db.tile_layers, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.tile_layers.delete({
      where: { tile_layer_id },
    })
    navigate(baseUrl)
  }, [baseUrl, db.tile_layers, navigate, tile_layer_id])

  const toNext = useCallback(async () => {
    const tileLayers = await db.tile_layers.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = tileLayers.length
    const index = tileLayers.findIndex((p) => p.tile_layer_id === tile_layer_id)
    const next = tileLayers[(index + 1) % len]
    navigate(`${baseUrl}/${next.tile_layer_id}`)
  }, [baseUrl, db.tile_layers, navigate, project_id, tile_layer_id])

  const toPrevious = useCallback(async () => {
    const tileLayers = await db.tile_layers.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = tileLayers.length
    const index = tileLayers.findIndex((p) => p.tile_layer_id === tile_layer_id)
    const previous = tileLayers[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.tile_layer_id}`)
  }, [baseUrl, db.tile_layers, navigate, project_id, tile_layer_id])

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
