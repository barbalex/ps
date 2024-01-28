import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Tile_layers as TileLayer } from '../../../generated/client'
import { createTileLayer } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { TextField } from '../../components/shared/TextField'
import { SwitchField } from '../../components/shared/SwitchField'
import { SliderField } from '../../components/shared/SliderField'
import { RadioGroupField } from '../../components/shared/RadioGroupField'
import { MultiSelect } from '../../components/shared/MultiSelect'
import { DropdownFieldOptions } from '../../components/shared/DropdownFieldOptions'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { FormHeader } from '../../components/FormHeader'
import { getCapabilitiesData } from './getCapabilitiesData'

import '../../form.css'

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

  // useEffect(() => {
  //   if (!row?.wms_base_url) return
  //   if (row?.wms_layers?.length) return
  //   console.log('hello TileLayer, getCapabilitiesData')
  //   getCapabilitiesData({ row, db })
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [tile_layer_id, row?.wms_base_url, row?.wms_layers, db])

  const onChange = useCallback(
    async (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      return await db.tile_layers.update({
        where: { tile_layer_id },
        data: { [name]: value },
      })
    },
    [db, tile_layer_id],
  )

  const onBlurWmsBaseUrl = useCallback(async () => {
    console.log('hello TileLayer, onBlurWmsBaseUrl, getting capabilities')
    getCapabilitiesData({ row, db })
  }, [db, row])

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
        {row?.type === 'wmts' && (
          <>
            <TextField
              label="URL Template"
              name="wmts_url_template"
              value={row.wmts_url_template ?? ''}
              onChange={onChange}
              multiLine={true}
              validationMessage="ℹ Projektion muss 3857 oder 4326 sein. Beispiel (Server-abhängig): https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg"
            />
            <TextField
              label="WMTS Subdomains TODO: array of strings"
              name="wmts_subdomains"
              value={row.wmts_subdomains ?? ''}
              onChange={onChange}
            />
          </>
        )}
        {row?.type === 'wms' && (
          <>
            <TextField
              label="WMS Base URL"
              name="wms_base_url"
              value={row.wms_base_url ?? ''}
              onChange={onChange}
              onBlur={onBlurWmsBaseUrl}
            />
            <MultiSelect
              label="WMS Layers"
              name="wms_layers"
              table="tile_layers"
              id={tile_layer_id}
              options={row.wms_layer_options ?? []}
              valueArray={row.wms_layers ?? []}
              validationMessage={
                row.wms_layers?.length > 1 ? 'Sie können mehrere wählen' : ''
              }
            />
            {!!row.wms_format_option?.length && (
              <DropdownFieldOptions
                label="WMS (Bild-)Format"
                name="wms_format"
                value={row.wms_format ?? ''}
                options={row.wms_format_options ?? []}
                onChange={onChange}
                validationMessage={
                  row.wms_format === 'image/png'
                    ? ''
                    : `Empfehlung: 'image/png'. Ermöglicht transparenten Hintergrund`
                }
              />
            )}
            <TextField
              label="WMS Parameters"
              name="wms_parameters"
              value={row.wms_parameters ?? ''}
              onChange={onChange}
              validationMessage="TODO: is an array of values, needs building"
            />
            <TextField
              label="WMS Styles"
              name="wms_styles"
              value={row.wms_styles ?? ''}
              onChange={onChange}
              validationMessage="TODO: is an array of strings, needs building"
            />
            <SwitchField
              label="Transparent background"
              name="wms_transparent"
              value={row.wms_transparent}
              onChange={onChange}
            />
            <TextField
              label="WMS Version"
              name="wms_version"
              value={row.wms_version ?? ''}
              onChange={onChange}
              validationMessage="Examples: '1.1.1', '1.3.0'. Set automatically but can be changed."
            />
            {!!row.wms_info_format_options?.length && (
              <DropdownFieldOptions
                label="WMS Info Format"
                name="wms_info_format"
                value={row.wms_info_format ?? ''}
                options={row.wms_info_format_options ?? []}
                onChange={onChange}
                validationMessage="In what format the info is downloaded. Set automatically but can be changed."
              />
            )}
            <SwitchField
              label="WMS Queryable"
              name="wms_queryable"
              value={row.wms_queryable}
              onChange={onChange}
              validationMessage="Set automatically but can be changed."
            />
          </>
        )}
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
        <SwitchField
          label="Grayscale"
          name="grayscale"
          value={row.grayscale}
          onChange={onChange}
        />
        <TextFieldInactive
          label="Local Data Size"
          name="local_data_size"
          value={row.local_data_size}
        />
        <TextFieldInactive
          label="Local Data Bounds"
          name="local_data_bounds"
          value={row.local_data_bounds}
        />
      </div>
    </div>
  )
}
