import { useOutletContext } from 'react-router-dom'

import { TextFieldInactive } from '../../../components/shared/TextFieldInactive.tsx'
import { TextField } from '../../../components/shared/TextField.tsx'
import { RadioGroupField } from '../../../components/shared/RadioGroupField.tsx'
import { LayersDropdown } from './LayersDropdown.tsx'
import { DropdownField } from '../../../components/shared/DropdownField.tsx'
import { PropertyField } from './PropertyField.tsx'
import { CreateWfsService } from './CreateWfsService.tsx'

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
  const vectorLayer = rowFromProps ?? outletContext?.row ?? {}

  return (
    <>
      {['wfs', 'upload'].includes(vectorLayer.type) && (
        <RadioGroupField
          label="Type"
          name="type"
          list={['wfs', 'upload']}
          value={vectorLayer.type ?? ''}
          onChange={onChange}
        />
      )}
      {vectorLayer?.type === 'wfs' && (
        <>
          <DropdownField
            label="Web Feature Service (WFS)"
            name="wfs_service_id"
            labelField="url"
            table="wfs_services"
            value={vectorLayer.wfs_service_id ?? ''}
            orderBy={{ url: 'asc' }}
            onChange={onChange}
            autoFocus={true}
            validationMessage={
              vectorLayer.wfs_service_id
                ? ''
                : 'Choose from a configured WFS. Or add a new one.'
            }
            noDataMessage="No WFS found. You can add one."
            hideWhenNoData={true}
          />
          {!vectorLayer.wfs_service_id && (
            <CreateWfsService vectorLayer={vectorLayer} />
          )}
          {!!vectorLayer?.wfs_service_id && (
            <LayersDropdown
              vectorLayer={vectorLayer}
              validationMessage={
                vectorLayer.wfs_service_layer_name ? '' : 'Select a layer'
              }
            />
          )}
        </>
      )}
      {vectorLayer?.type === 'upload' && <div>TODO: Upload</div>}
      {vectorLayer?.type === 'wfs' &&
        vectorLayer?.wfs_service_id &&
        vectorLayer.wfs_service_layer_name && (
          <TextField
            label="Label"
            name="label"
            value={vectorLayer.label ?? ''}
            onChange={onChange}
          />
        )}
      {!['wfs', 'upload'].includes(vectorLayer.type) && (
        <TextFieldInactive
          label="Label"
          name="label"
          value={vectorLayer.label}
        />
      )}
      {((vectorLayer?.type === 'wfs' &&
        vectorLayer?.wfs_service_id &&
        vectorLayer.wfs_service_layer_name) ||
        !['wfs', 'upload'].includes(vectorLayer.type)) && (
        <>
          {/* TODO: add display by property field */}
          <PropertyField vectorLayer={vectorLayer} />
          <TextField
            label="Max Zoom"
            name="max_zoom"
            value={vectorLayer.max_zoom ?? ''}
            onChange={onChange}
            type="number"
            max={19}
            min={0}
            validationMessage="Zoom can be between 0 and 19"
          />
          <TextField
            label="Min Zoom"
            name="min_zoom"
            value={vectorLayer.min_zoom ?? ''}
            onChange={onChange}
            type="number"
            max={19}
            min={0}
            validationMessage="Zoom can be between 0 and 19"
          />
          <TextField
            label="Max number of features"
            name="max_features"
            value={vectorLayer.max_features ?? ''}
            onChange={onChange}
            type="number"
            validationMessage="Drawing too many features can crash the app. Your mileage may vary"
          />
          {/* <VectorLayerDisplay row={row} /> */}
        </>
      )}
      {vectorLayer?.type === 'upload' && (
        <>
          <TextFieldInactive
            label="Feature count"
            name="feature_count"
            value={vectorLayer.feature_count}
          />
          <TextFieldInactive
            label="Point count"
            name="point_count"
            value={vectorLayer.point_count}
          />
          <TextFieldInactive
            label="Line count"
            name="line_count"
            value={vectorLayer.line_count}
          />
          <TextFieldInactive
            label="Polygon count"
            name="polygon_count"
            value={vectorLayer.polygon_count}
          />
        </>
      )}
    </>
  )
}
