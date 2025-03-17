import { memo } from 'react'

import { TextField } from '../../../components/shared/TextField.tsx'
import { TextFieldInactive } from '../../../components/shared/TextFieldInactive.tsx'
import { DropdownField } from '../../../components/shared/DropdownField.tsx'
// import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { LayersDropdown } from './LayersDropdown.tsx'
import { CreateWmsService } from './CreateWmsService/index.tsx'

import '../../../form.css'

// this form is rendered from a parent or outlet
export const WmsLayerForm = memo(({ onChange, row, isFilter }) => {
  // TODO: implement later
  const isOffline = false

  return (
    <>
      <DropdownField
        label="Web Map Service (WMS)"
        name="wms_service_id"
        labelField="url"
        table="wms_services"
        value={row.wms_service_id ?? ''}
        orderBy="url"
        onChange={onChange}
        autoFocus={true}
        validationMessage={
          row.wms_service_id ? '' : (
            'Choose from a configured WMS. Or add a new one.'
          )
        }
        noDataMessage="No WMS found. You can add one."
        hideWhenNoData={true}
      />
      <CreateWmsService wmsLayer={row} />
      {(row?.wms_service_id || isFilter) && (
        <LayersDropdown
          wmsLayer={row}
          validationMessage={row.wms_service_layer_name ? '' : 'Select a layer'}
        />
      )}
      {((!!row.wms_service_id && !!row?.wms_service_layer_name) ||
        isFilter) && (
        <>
          <TextField
            label="Label"
            name="label"
            value={row.label ?? ''}
            onChange={onChange}
          />
          {/* {wmsLayer?.wms_service_id && (
              <>
                <DropdownFieldFromWmsServiceLayers
                  label="(Image-)Format"
                  name="wms_format"
                  value={wmsLayer.wms_format ?? ''}
                  wms_layer_id={wms_layer_id}
                  onChange={onChange}
                  validationMessage={
                    wmsLayer.wms_format === 'image/png'
                      ? ''
                      : `Empfehlung: 'image/png'. Ermöglicht transparenten Hintergrund`
                  }
                />
                <TextField
                  label="WMS Version"
                  name="wms_version"
                  value={wmsLayer.wms_version ?? ''}
                  onChange={onChange}
                  validationMessage="Examples: '1.1.1', '1.3.0'. Set automatically but can be changed"
                />
                <DropdownFieldFromWmsServiceLayers
                  label="Info Format"
                  name="wms_info_format"
                  value={wmsLayer.wms_info_format ?? ''}
                  wms_layer_id={wms_layer_id}
                  onChange={onChange}
                  validationMessage="In what format the info is downloaded. Set automatically but can be changed"
                />
              </>
            )} */}
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
})
