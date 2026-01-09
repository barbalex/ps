import { TextFieldInactive } from '../../../components/shared/TextFieldInactive.tsx'
import { TextField } from '../../../components/shared/TextField.tsx'
import { LayersDropdown } from './LayersDropdown.tsx'
import { DropdownField } from '../../../components/shared/DropdownField.tsx'
import { DropdownFieldSimpleOptions } from '../../../components/shared/DropdownFieldSimpleOptions.tsx'
import { Property } from './Property.tsx'
import { CreateWfsService } from './CreateWfsService.tsx'

import '../../../form.css'

const vectorLayerTypes = ['wfs', 'upload', 'own']

// this is just for presentation of data or filter values

export const VectorLayerForm = ({
  onChange,
  validations = {},
  row,
  isFilter,
  from,
}) => {
  return (
    <>
      <DropdownFieldSimpleOptions
        label="Type"
        name="type"
        options={vectorLayerTypes}
        value={row.type ?? ''}
        onChange={onChange}
      />
      {row?.type === 'wfs' && (
        <>
          <DropdownField
            label="Web Feature Service (WFS)"
            name="wfs_service_id"
            labelField="url"
            table="wfs_services"
            value={row.wfs_service_id ?? ''}
            orderBy="url"
            onChange={onChange}
            autoFocus={true}
            validationMessage={
              row.wfs_service_id ? '' : (
                'Choose from a configured WFS. Or add a new one.'
              )
            }
            noDataMessage="No WFS found. You can add one."
            hideWhenNoData={true}
          />
          {!row.wfs_service_id && <CreateWfsService vectorLayer={row} />}
          {!!row?.wfs_service_id && (
            <LayersDropdown
              vectorLayer={row}
              validationMessage={
                row.wfs_service_layer_name ? '' : 'Select a layer'
              }
            />
          )}
        </>
      )}
      {row?.type === 'upload' && <div>TODO: Upload</div>}
      {row?.type === 'wfs' &&
        row?.wfs_service_id &&
        row.wfs_service_layer_name && (
          <TextField
            label="Label"
            name="label"
            value={row.label ?? ''}
            onChange={onChange}
            validationMessage={validations.label?.message}
            validationState={validations.label?.state}
          />
        )}
      {row?.type === 'own' && (
        <TextField
          label="Label"
          name="label"
          value={row.label ?? ''}
          onChange={onChange}
          validationMessage={validations.label?.message}
          validationState={validations.label?.state}
        />
      )}
      {!['wfs', 'upload', 'own'].includes(row.type) && (
        <>
          {isFilter ?
            <TextField
              label="Label"
              name="label"
              value={row.label ?? ''}
              onChange={onChange}
              validationMessage={validations.label?.message}
              validationState={validations.label?.state}
            />
          : <TextFieldInactive
              label="Label"
              name="label"
              value={row.label}
            />
          }
        </>
      )}
      <Property
        vectorLayer={row}
        from={from}
      />
      <TextField
        label="Max number of features"
        name="max_features"
        value={row.max_features ?? ''}
        onChange={onChange}
        type="number"
        validationMessage="Drawing too many features can crash the app"
      />
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
