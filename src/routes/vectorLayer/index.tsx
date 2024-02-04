import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { Vector_layers as VectorLayer } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { TextField } from '../../components/shared/TextField'
import { SwitchField } from '../../components/shared/SwitchField'
import { RadioGroupField } from '../../components/shared/RadioGroupField'
import { SliderField } from '../../components/shared/SliderField'
import { DropdownFieldFromLayerOptions } from '../../components/shared/DropdownFieldFromLayerOptions'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { Header } from './Header'
import { Url } from './Url'

import '../../form.css'

export const Component = () => {
  const { vector_layer_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.vector_layers.liveUnique({ where: { vector_layer_id } }),
  )

  const row: VectorLayer = results

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.vector_layers.update({
        where: { vector_layer_id },
        data: { [name]: value },
      })
    },
    [db.vector_layers, vector_layer_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  // console.log('hello VectorLayer, row:', row)

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="vector_layer_id"
          value={row.vector_layer_id}
        />
        <RadioGroupField
          label="Type"
          name="type"
          list={['wfs', 'upload']}
          value={row.type ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        {row?.type === 'wfs' && (
          <>
            <Url onChange={onChange} row={row} />
            {!!row?.url && (
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
        {row?.type === 'wfs' && row?.url && row.wfs_layer && (
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
              validationMessage="Add a sorting order here if sorting by label is not desired."
            />
            <SwitchField
              label="active"
              name="active"
              value={row.active}
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
            <TextField
              label="Max number of features"
              name="max_features"
              value={row.max_features ?? ''}
              onChange={onChange}
              type="number"
              validationMessage="Drawing too many features can crash the app. Your mileage may vary."
            />
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
      </div>
    </div>
  )
}
