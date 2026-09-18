import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'

import { observationImportGeometryMethodOptions } from '../../../modules/constants.ts'
import { RadioGroupField } from '../../../components/shared/RadioGroupField.tsx'
import type ObservationImports from '../../../models/public/ObservationImports.ts'

type InputOnChangeData = Parameters<
  NonNullable<
    React.ComponentProps<typeof fluentUiReactComponents.Input>['onChange']
  >
>[1]

export const GeometryMethod = ({
  onChange,
  validations,
  row,
}: {
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData,
  ) => Promise<void>
  validations?: Record<string, { state: 'error'; message: string }>
  row: ObservationImports
}) => {
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
