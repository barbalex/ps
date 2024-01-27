import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Tile_layers as TileLayer } from '../../../generated/client'
import { createTileLayer } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { TextField } from '../components/shared/TextField'
import { SwitchField } from '../components/shared/SwitchField'
import { SliderField } from '../components/shared/SliderField'
import { RadioGroupField } from '../components/shared/RadioGroupField'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormHeader } from '../components/FormHeader'

import '../form.css'

export const Component = () => {
  const { project_id, tile_layer_id } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.tile_layers.liveUnique({ where: { tile_layer_id } }),
  )

  const baseUrl = `/projects/${project_id}/tile-layers`

  const addRow = useCallback(async () => {
    const tileLayer = createTileLayer({ project_id })
    await db.tile_layers.create({ data: tileLayer })
    navigate(`${baseUrl}/${tileLayer.tile_layer_id}`)
    autoFocusRef.current?.focus()
  }, [baseUrl, db.tile_layers, navigate, project_id])

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

  const row: TileLayer = results

  const onChange = useCallback(
    async (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      console.log('hello tileLayer, onChange, result', { e, data, name, value })
      const result = await db.tile_layers.update({
        where: { tile_layer_id },
        data: { [name]: value },
      })
      console.log('hello tileLayer, onChange, result', { result })
      return
    },
    [db.tile_layers, tile_layer_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-outer-container">
      <FormHeader
        title="Tile Layer"
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="tile layer"
      />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="tile_layer_id"
          value={row.tile_layer_id}
        />
        <TextField
          label="Label"
          name="label"
          value={row.label ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <TextField
          label="Sort"
          name="sort"
          value={row.sort ?? ''}
          onChange={onChange}
          type="number"
          validationMessage="Add a sorting order here if alphabetically by label is not desired."
        />
        <SwitchField
          label="active"
          name="active"
          value={row.active}
          onChange={onChange}
        />
        <RadioGroupField
          label="Type"
          name="type"
          list={['wms', 'wmts']}
          value={row.type ?? ''}
          onChange={onChange}
        />
        <TextField
          label="WMTS Subdomains TODO: array of strings"
          name="wmts_subdomains"
          value={row.wmts_subdomains ?? ''}
          onChange={onChange}
        />
        <TextField
          label="Max Zoom"
          name="max_zoom"
          value={row.max_zoom ?? ''}
          onChange={onChange}
          type="number"
          max={19}
          min={0}
          validationMessage="Zoom can be between 0 and 19"
        />
        <TextField
          label="Min Zoom"
          name="min_zoom"
          value={row.min_zoom ?? ''}
          onChange={onChange}
          type="number"
          max={19}
          min={0}
          validationMessage="Zoom can be between 0 and 19"
        />
        <SliderField
          label="Opacity (%)"
          name="opacity_percent"
          value={row.opacity_percent ?? ''}
          onChange={onChange}
          max={100}
          min={0}
          step={5}
        />
      </div>
    </div>
  )
}
