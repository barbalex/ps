import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { Tile_layers as TileLayer } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { TextField } from '../../components/shared/TextField'
import { SwitchField } from '../../components/shared/SwitchField'
import { SliderField } from '../../components/shared/SliderField'
import { RadioGroupField } from '../../components/shared/RadioGroupField'
import { MultiSelectFromLayerOptions } from '../../components/shared/MultiSelectFromLayerOptions'
import { DropdownFieldFromLayerOptions } from '../../components/shared/DropdownFieldFromLayerOptions'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { BaseUrl } from './BaseUrl'
import { Header } from './Header'

import '../../form.css'

export const Component = () => {
  const { tile_layer_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.tile_layers.liveUnique({ where: { tile_layer_id } }),
  )

  const row: TileLayer = results

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

  if (!row) {
    return <div>Loading...</div>
  }

  // console.log('hello TileLayer, row:', row)

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="tile_layer_id"
          value={row.tile_layer_id}
        />
        <RadioGroupField
          label="Type"
          name="type"
          list={['wms', 'wmts']}
          value={row.type ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        {row?.type === 'wms' && (
          <>
            <BaseUrl row={row} onChange={onChange} />
            {row?.wms_base_url && (
              <>
                {/* TODO: pass row to set label */}
                <MultiSelectFromLayerOptions
                  name="wms_layers"
                  label="Layers"
                  table="tile_layers"
                  tile_layer_id={tile_layer_id}
                  valueArray={row.wms_layers ?? []}
                  row={row}
                  validationMessage={
                    row.wms_layers?.length === 1
                      ? 'Sie können mehrere wählen (falls das sinnvoll scheint)'
                      : ''
                  }
                />
              </>
            )}
          </>
        )}
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
              label="Subdomains TODO: array of strings"
              name="wmts_subdomains"
              value={row.wmts_subdomains ?? ''}
              onChange={onChange}
            />
          </>
        )}
        {((row?.type === 'wms' && row?.wms_base_url) ||
          (row?.type === 'wmts' && row?.wmts_url_template)) && (
          <>
            <TextField
              label="Label"
              name="label"
              value={row.label ?? ''}
              onChange={onChange}
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
            {row?.type === 'wms' && row?.wms_base_url && (
              <>
                <DropdownFieldFromLayerOptions
                  label="(Image-)Format"
                  name="wms_format"
                  value={row.wms_format ?? ''}
                  tile_layer_id={tile_layer_id}
                  onChange={onChange}
                  validationMessage={
                    row.wms_format === 'image/png'
                      ? ''
                      : `Empfehlung: 'image/png'. Ermöglicht transparenten Hintergrund`
                  }
                />
                <TextField
                  label="Parameters"
                  name="wms_parameters"
                  value={row.wms_parameters ?? ''}
                  onChange={onChange}
                  validationMessage="TODO: is an array of values, needs building"
                />
                <TextField
                  label="Styles"
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
                <DropdownFieldFromLayerOptions
                  label="Info Format"
                  name="wms_info_format"
                  value={row.wms_info_format ?? ''}
                  tile_layer_id={tile_layer_id}
                  onChange={onChange}
                  validationMessage="In what format the info is downloaded. Set automatically but can be changed."
                />
                <SwitchField
                  label="Queryable"
                  name="wms_queryable"
                  value={row.wms_queryable}
                  onChange={onChange}
                  validationMessage="Whether the wms service is queryable. May not work for all layers if multiple exist. Set automatically but can be changed."
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
            <div>TODO: show the following only if loaded for offline</div>
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
          </>
        )}
      </div>
    </div>
  )
}
