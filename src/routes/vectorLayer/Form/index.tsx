import { useOutletContext } from 'react-router-dom'

import { TextFieldInactive } from '../../../components/shared/TextFieldInactive.tsx'
import { TextField } from '../../../components/shared/TextField.tsx'
import { RadioGroupField } from '../../../components/shared/RadioGroupField.tsx'
import { DropdownFieldFromWfsServiceLayers } from './DropdownFieldFromWfsServiceLayers.tsx'
import { DropdownField } from '../../../components/shared/DropdownField.tsx'
import { PropertyField } from './PropertyField.tsx'
import { FetchWfsCapabilities } from './FetchWfsCapabilities.tsx'
import { isValidUrl } from '../../../modules/isValidUrl.ts'

import '../../../form.css'

// this is just for presentation of data or filter values

export const Component = ({
  onChange: onChangeFromProps,
  row: rowFromProps,
  autoFocusRef,
}) => {
  // beware: contextFromOutlet is undefined if not inside an outlet
  const outletContext = useOutletContext()
  const onChange = onChangeFromProps ?? outletContext?.onChange
  const wfsLayer = rowFromProps ?? outletContext?.row ?? {}

  return (
    <>
      {['wfs', 'upload'].includes(wfsLayer.type) && (
        <RadioGroupField
          label="Type"
          name="type"
          list={['wfs', 'upload']}
          value={wfsLayer.type ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
      )}
      {wfsLayer?.type === 'wfs' && (
        <>
          <DropdownField
            label="WFS Service"
            name="wfs_service_id"
            labelField="url"
            table="wfs_services"
            value={wfsLayer.wfs_service_id ?? ''}
            orderBy={{ url: 'asc' }}
            onChange={onChange}
            autoFocus={true}
            validationMessage={
              wfsLayer.wfs_service_id
                ? ''
                : 'Choose from a configured WFS service. If none exists, create one.'
            }
          />
          <div>TODO: create wms service component</div>
          {!!wfsLayer?.wfs_url && isValidUrl(wfsLayer.wfs_url) && (
            <FetchWfsCapabilities vectorLayer={wfsLayer} />
          )}
          {!!wfsLayer?.wfs_service_id && (
            <DropdownFieldFromWfsServiceLayers
              wfsLayer={wfsLayer}
              validationMessage={
                wfsLayer.wfs_service_layer_name ? '' : 'Select a layer'
              }
            />
          )}
        </>
      )}
      {wfsLayer?.type === 'upload' && <div>TODO: Upload</div>}
      {wfsLayer?.type === 'wfs' && wfsLayer?.wfs_url && wfsLayer.wfs_layer && (
        <TextField
          label="Label"
          name="label"
          value={wfsLayer.label ?? ''}
          onChange={onChange}
        />
      )}
      {!['wfs', 'upload'].includes(wfsLayer.type) && (
        <TextFieldInactive label="Label" name="label" value={wfsLayer.label} />
      )}
      {((wfsLayer?.type === 'wfs' && wfsLayer?.wfs_url && wfsLayer.wfs_layer) ||
        !['wfs', 'upload'].includes(wfsLayer.type)) && (
        <>
          {/* TODO: add display by property field */}
          <PropertyField vectorLayer={wfsLayer} />
          <TextField
            label="Max Zoom"
            name="max_zoom"
            value={wfsLayer.max_zoom ?? ''}
            onChange={onChange}
            type="number"
            max={19}
            min={0}
            validationMessage="Zoom can be between 0 and 19"
          />
          <TextField
            label="Min Zoom"
            name="min_zoom"
            value={wfsLayer.min_zoom ?? ''}
            onChange={onChange}
            type="number"
            max={19}
            min={0}
            validationMessage="Zoom can be between 0 and 19"
          />
          <TextField
            label="Max number of features"
            name="max_features"
            value={wfsLayer.max_features ?? ''}
            onChange={onChange}
            type="number"
            validationMessage="Drawing too many features can crash the app. Your mileage may vary"
          />
          {/* <VectorLayerDisplay row={row} /> */}
        </>
      )}
      {wfsLayer?.type === 'upload' && (
        <>
          <TextFieldInactive
            label="Feature count"
            name="feature_count"
            value={wfsLayer.feature_count}
          />
          <TextFieldInactive
            label="Point count"
            name="point_count"
            value={wfsLayer.point_count}
          />
          <TextFieldInactive
            label="Line count"
            name="line_count"
            value={wfsLayer.line_count}
          />
          <TextFieldInactive
            label="Polygon count"
            name="polygon_count"
            value={wfsLayer.polygon_count}
          />
        </>
      )}
    </>
  )
}
