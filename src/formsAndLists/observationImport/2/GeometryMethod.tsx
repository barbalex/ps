import { useIntl } from 'react-intl'

import { observationImportGeometryMethodOptions } from '../../../modules/constants.ts'
import { RadioGroupField } from '../../../components/shared/RadioGroupField.tsx'

export const GeometryMethod = ({ onChange, validations, row }) => {
  const { formatMessage } = useIntl()
  const geometryMethods = observationImportGeometryMethodOptions.map(
    (o) => o.value,
  )

  return (
    <RadioGroupField
      label={formatMessage({
        id: 'gMtLbl',
        defaultMessage: 'Wie sind die Geometrien in den Daten enthalten?',
      })}
      name="geometry_method"
      list={geometryMethods}
      value={row.geometry_method ?? ''}
      onChange={onChange}
      validationState={validations?.geometry_method?.state}
      validationMessage={
        validations?.geometry_method?.message ??
        formatMessage({
          id: 'gMtVld',
          defaultMessage: 'GeoJSON und Koordinatenfelder werden unterstützt',
        })
      }
    />
  )
}
