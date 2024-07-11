import { memo } from 'react'
import { useOutletContext, useLocation } from 'react-router-dom'

import { TextField } from '../../../components/shared/TextField.tsx'
import { TextFieldInactive } from '../../../components/shared/TextFieldInactive.tsx'
import { DropdownField } from '../../../components/shared/DropdownField.tsx'
// import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { LayersDropdown } from './LayersDropdown.tsx'
import { CreateWmsService } from './CreateWmsService/index.tsx'

import '../../../form.css'

// this form is rendered from a parent or outlet
export const Component = memo(
  ({ onChange: onChangeFromProps, wmsLayer: wmsLayerFromProps }) => {
    // beware: contextFromOutlet is undefined if not inside an outlet
    const outletContext = useOutletContext()
    const onChange = onChangeFromProps ?? outletContext?.onChange
    const wmsLayer = wmsLayerFromProps ?? outletContext?.row ?? {}

    const { pathname } = useLocation()
    const isFilter = pathname.endsWith('filter')

    // TODO: implement later
    const isOffline = false

    return (
      <>
        <DropdownField
          label="Web Map Service (WMS)"
          name="wms_service_id"
          labelField="url"
          table="wms_services"
          value={wmsLayer.wms_service_id ?? ''}
          orderBy={{ url: 'asc' }}
          onChange={onChange}
          autoFocus={true}
          validationMessage={
            wmsLayer.wms_service_id
              ? ''
              : 'Choose from a configured WMS. Or add a new one.'
          }
          noDataMessage="No WMS found. You can add one."
          hideWhenNoData={true}
        />
        <CreateWmsService wmsLayer={wmsLayer} />
        {(wmsLayer?.wms_service_id || isFilter) && (
          <LayersDropdown
            wmsLayer={wmsLayer}
            validationMessage={
              wmsLayer.wms_service_layer_name ? '' : 'Select a layer'
            }
          />
        )}
        {((!!wmsLayer.wms_service_id && !!wmsLayer?.wms_service_layer_name) ||
          isFilter) && (
          <>
            <TextField
              label="Label"
              name="label"
              value={wmsLayer.label ?? ''}
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
            <TextField
              label="Max Zoom"
              name="max_zoom"
              value={wmsLayer.max_zoom ?? ''}
              onChange={onChange}
              type="number"
              max={19}
              min={0}
              validationMessage="Zoom can be between 0 and 19"
            />
            <TextField
              label="Min Zoom"
              name="min_zoom"
              value={wmsLayer.min_zoom ?? ''}
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
                  value={wmsLayer.local_data_size}
                />
                <TextFieldInactive
                  label="Local Data Bounds"
                  name="local_data_bounds"
                  value={wmsLayer.local_data_bounds}
                />
              </>
            )}
          </>
        )}
      </>
    )
  },
)
