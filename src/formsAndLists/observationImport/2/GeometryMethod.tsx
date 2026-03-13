import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'
import { useIntl } from 'react-intl'

import { RadioGroupField } from '../../../components/shared/RadioGroupField.tsx'

export const GeometryMethod = ({ onChange, validations, row }) => {
  const { formatMessage } = useIntl()
  const isFirstRender = useIsFirstRender()
  const res = useLiveQuery(
    `SELECT geometry_method FROM observation_imports_geometry_methods order by sort, geometry_method`,
  )
  const isLoading = isFirstRender && res === undefined
  const geometryMethods = res?.rows.map((row) => row.geometry_method) ?? []

  return (
    <RadioGroupField
      label={formatMessage({ id: 'gMtLbl', defaultMessage: 'Wie sind die Geometrien in den Daten enthalten?' })}
      name="geometry_method"
      list={geometryMethods}
      isLoading={isLoading}
      value={row.geometry_method ?? ''}
      onChange={onChange}
      validationState={validations?.geometry_method?.state}
      validationMessage={
        validations?.geometry_method?.message ??
        formatMessage({ id: 'gMtVld', defaultMessage: 'GeoJSON und Koordinatenfelder werden unterstützt' })
      }
    />
  )
}
