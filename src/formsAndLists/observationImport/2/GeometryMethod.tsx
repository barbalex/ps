import { useIntl } from 'react-intl'

import { observationImportGeometryMethodOptions } from '../../../modules/constants.ts'
import { RadioGroupField } from '../../../components/shared/RadioGroupField.tsx'
import type ObservationImports from '../../../models/public/ObservationImports.ts'
import type { FieldChangeData } from '../../../components/shared/fieldChange.ts'

export const GeometryMethod = ({
  onChange,
  validations,
  row,
}: {
  onChange: (
    e: React.ChangeEvent<HTMLElement>,
    data?: FieldChangeData,
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
