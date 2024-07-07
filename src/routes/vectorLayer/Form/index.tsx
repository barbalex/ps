import { useParams, useOutletContext } from 'react-router-dom'

import { TextFieldInactive } from '../../../components/shared/TextFieldInactive.tsx'
import { TextField } from '../../../components/shared/TextField.tsx'
import { RadioGroupField } from '../../../components/shared/RadioGroupField.tsx'
import { DropdownFieldFromLayerOptions } from '../../../components/shared/DropdownFieldFromLayerOptions.tsx'
import { Url } from './Url.tsx'
import { PropertyField } from './PropertyField.tsx'

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
  const row = rowFromProps ?? outletContext?.row ?? {}

  const { vector_layer_id } = useParams()

  return (
    <>
      {['wfs', 'upload'].includes(row.type) && (
        <RadioGroupField
          label="Type"
          name="type"
          list={['wfs', 'upload']}
          value={row.type ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
      )}
      {row?.type === 'wfs' && (
        <>
          <Url onChange={onChange} row={row} />
          {!!row?.wfs_version && (
            <DropdownFieldFromLayerOptions
              label="Layer"
              name="wfs_layer"
              value={row.wfs_layer ?? ''}
              vector_layer_id={vector_layer_id}
              onChange={onChange}
              validationMessage={row.wfs_layer ? '' : 'Select a layer'}
              row={row}
            />
          )}
        </>
      )}
      {row?.type === 'upload' && <div>TODO: Upload</div>}
      {row?.type === 'wfs' && row?.wfs_url && row.wfs_layer && (
        <TextField
          label="Label"
          name="label"
          value={row.label ?? ''}
          onChange={onChange}
        />
      )}
      {!['wfs', 'upload'].includes(row.type) && (
        <TextFieldInactive label="Label" name="label" value={row.label} />
      )}
      {((row?.type === 'wfs' && row?.wfs_url && row.wfs_layer) ||
        !['wfs', 'upload'].includes(row.type)) && (
        <>
          {/* TODO: add display by property field */}
          <PropertyField vectorLayer={row} />
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
          <TextField
            label="Max number of features"
            name="max_features"
            value={row.max_features ?? ''}
            onChange={onChange}
            type="number"
            validationMessage="Drawing too many features can crash the app. Your mileage may vary"
          />
          {/* <VectorLayerDisplay row={row} /> */}
        </>
      )}
      {row?.type === 'upload' && (
        <>
          <TextFieldInactive
            label="Feature count"
            name="feature_count"
            value={row.feature_count}
          />
          <TextFieldInactive
            label="Point count"
            name="point_count"
            value={row.point_count}
          />
          <TextFieldInactive
            label="Line count"
            name="line_count"
            value={row.line_count}
          />
          <TextFieldInactive
            label="Polygon count"
            name="polygon_count"
            value={row.polygon_count}
          />
        </>
      )}
    </>
  )
}
