import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { SliderFieldWithInput } from '../../components/shared/SliderFieldWithInput.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { MarkerSymbolPicker } from './MarkerSymbolPicker/index.tsx'
import { ColorPicker } from '../../components/shared/ColorPicker.tsx'
import { MarkerType } from './MarkerType.tsx'
import { LineCap } from './LineCap.tsx'
import { LineJoin } from './LineJoin.tsx'
import { FillRule } from './FillRule.tsx'

import type VectorLayerDisplays from '../../models/public/VectorLayerDisplays.ts'

type VectorLayerDisplayFormValidations = Record<
  string,
  { state: string; message: string } | undefined
>

type VectorLayerDisplayFormProps = {
  row: VectorLayerDisplays
  onChange: (e: React.ChangeEvent<HTMLInputElement>, data?: unknown) => void
  validations: VectorLayerDisplayFormValidations
}

export const VectorLayerDisplayForm = ({
  row,
  onChange,
  validations,
}: VectorLayerDisplayFormProps) => {
  const { formatMessage } = useIntl()

  return (
    <>
      <MarkerType onChange={onChange} row={row} />
      {row.marker_type === 'circle' && (
        <TextField
          name="circle_marker_radius"
          label={formatMessage({
            id: 'Ab5CdE',
            defaultMessage: 'Kreis-Radius in Bild-Punkten',
          })}
          value={row.circle_marker_radius}
          onChange={onChange}
          type="number"
          validationMessage={validations?.circle_marker_radius?.message}
          validationState={validations?.circle_marker_radius?.state}
        />
      )}
      {row.marker_type === 'marker' && (
        <>
          <MarkerSymbolPicker onChange={onChange} value={row.marker_symbol} />
          <TextField
            name="marker_size"
            label={formatMessage({
              id: 'Bc6DeF',
              defaultMessage: 'Symbol: Grösse (in Bild-Punkten)',
            })}
            value={row.marker_size}
            onChange={onChange}
            type="number"
            validationMessage={validations?.marker_size?.message}
            validationState={validations?.marker_size?.state}
          />
        </>
      )}
      <ColorPicker
        key={`${row.vector_layer_display_id}/color`}
        label={formatMessage({
          id: 'Cd7EfG',
          defaultMessage: 'Linien und Punkte: Farbe',
        })}
        onChange={onChange}
        color={row.color}
        name="color"
      />
      <TextField
        name="weight"
        label={formatMessage({
          id: 'De8FgH',
          defaultMessage: 'Linien: Breite (in Bild-Punkten)',
        })}
        value={row.weight}
        onChange={onChange}
        type="number"
        validationMessage={validations?.weight?.message}
        validationState={validations?.weight?.state}
      />
      <LineCap onChange={onChange} row={row} />
      <LineJoin onChange={onChange} row={row} />
      <TextField
        name="dash_array"
        label={formatMessage({
          id: 'Gh1IjK',
          defaultMessage: 'Linien: Dash-Array',
        })}
        value={row.dash_array}
        onChange={onChange}
        validationMessage={validations?.dash_array?.message}
        validationState={validations?.dash_array?.state}
      />
      <TextField
        name="dash_offset"
        label={formatMessage({
          id: 'Hi2JkL',
          defaultMessage: 'Linien: Dash-Offset',
        })}
        value={row.dash_offset}
        onChange={onChange}
        validationMessage={validations?.dash_offset?.message}
        validationState={validations?.dash_offset?.state}
      />
      <SwitchField
        label={formatMessage({
          id: 'Ij3KlM',
          defaultMessage: 'Umriss-Linien zeichnen (Polygone und Kreise)',
        })}
        name="stroke"
        value={row.stroke}
        onChange={onChange}
        validationMessage={validations?.stroke?.message}
        validationState={validations?.stroke?.state}
      />
      <SwitchField
        label={formatMessage({
          id: 'Jk4LmN',
          defaultMessage: 'Flächen füllen',
        })}
        name="fill"
        value={row.fill}
        onChange={onChange}
        validationMessage={validations?.fill?.message}
        validationState={validations?.fill?.state}
      />
      <ColorPicker
        id={`${row.vector_layer_display_id}/fill_color`}
        label={formatMessage({
          id: 'Kl5MnO',
          defaultMessage: 'Füllung: Farbe',
        })}
        name="fill_color"
        onChange={onChange}
        color={row.fill_color}
      />
      <SliderFieldWithInput
        label={formatMessage({
          id: 'Lm6NoP',
          defaultMessage: 'Füllung: Deckkraft (%)',
        })}
        name="fill_opacity_percent"
        value={row.fill_opacity_percent ?? ''}
        onChange={onChange}
        max={100}
        min={0}
        step={5}
      />
      <FillRule onChange={onChange} row={row} />
    </>
  )
}
