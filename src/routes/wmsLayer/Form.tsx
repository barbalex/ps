import { memo } from 'react'
import { useOutletContext, useParams, useLocation } from 'react-router-dom'

import { TextField } from '../../components/shared/TextField.tsx'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
// import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { DropdownFieldFromLayerOptions } from '../../components/shared/DropdownFieldFromLayerOptions.tsx'
// import { wms_layer_type_enumSchema as typeSchema } from '../../generated/client/index.ts'
import { FetchCapabilities } from './FetchCapabilities.tsx'
import { CreateWmsService } from './CreateWmsService.tsx'

import '../../form.css'

// this form is rendered from a parent or outlet
export const Component = memo(
  ({ onChange: onChangeFromProps, row: rowFromProps }) => {
    // beware: contextFromOutlet is undefined if not inside an outlet
    const outletContext = useOutletContext()
    const onChange = onChangeFromProps ?? outletContext?.onChange
    const row = rowFromProps ?? outletContext?.row ?? {}

    const { wms_layer_id } = useParams()
    const { pathname } = useLocation()
    const isFilter = pathname.endsWith('filter')

    // TODO: implement later
    const isOffline = false

    return (
      <>
        {/* <RadioGroupField
          label="Type"
          name="type"
          list={typeSchema?.options.filter((t) => t === 'wms') ?? []}
          value={row.type ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
          // disabled as for now only WMS is supported
          disabled
        /> */}
        <DropdownField
          label="WMS Service"
          name="wms_service_id"
          table="wms_services"
          orderBy={{ url: 'asc' }}
          value={row.wms_service_id ?? ''}
          onChange={onChange}
          autoFocus={true}
          validationMessage="Choose from a configured WMS service. If none exists, create one first."
        />
        <CreateWmsService />
        {!!row?.wms_url && <FetchCapabilities row={row} />}
        {(row?.wms_version || isFilter) && (
          <DropdownFieldFromLayerOptions
            label="Layer"
            name="wms_layer"
            value={row.wms_layer ?? ''}
            wms_layer_id={wms_layer_id}
            onChange={onChange}
            validationMessage={row.wms_layer ? '' : 'Select a layer'}
            row={row}
          />
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
        {((row?.type === 'wms' && row?.wms_layer) ||
          (row?.type === 'wmts' && row?.wmts_url_template) ||
          isFilter) && (
          <>
            <TextField
              label="Label"
              name="label"
              value={row.label ?? ''}
              onChange={onChange}
            />
            {row?.type === 'wms' && row?.wms_url && (
              <>
                <DropdownFieldFromLayerOptions
                  label="(Image-)Format"
                  name="wms_format"
                  value={row.wms_format ?? ''}
                  wms_layer_id={wms_layer_id}
                  onChange={onChange}
                  validationMessage={
                    row.wms_format === 'image/png'
                      ? ''
                      : `Empfehlung: 'image/png'. Ermöglicht transparenten Hintergrund`
                  }
                />
                <TextField
                  label="WMS Version"
                  name="wms_version"
                  value={row.wms_version ?? ''}
                  onChange={onChange}
                  validationMessage="Examples: '1.1.1', '1.3.0'. Set automatically but can be changed"
                />
                <DropdownFieldFromLayerOptions
                  label="Info Format"
                  name="wms_info_format"
                  value={row.wms_info_format ?? ''}
                  wms_layer_id={wms_layer_id}
                  onChange={onChange}
                  validationMessage="In what format the info is downloaded. Set automatically but can be changed"
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
            {isOffline && (
              <>
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
          </>
        )}
      </>
    )
  },
)
