import { useIntl } from 'react-intl'

import { RadioGroupFromOptions } from '../../components/shared/RadioGroupFromOptions.tsx'
import { vectorLayerMarkerTypeOptions } from '../../modules/constants.ts'

export const MarkerType = ({ onChange, row }) => {
  const { formatMessage } = useIntl()

  const options = vectorLayerMarkerTypeOptions.map((o) => ({
    value: o.value,
    label: formatMessage({ id: o.labelId, defaultMessage: o.defaultMessage }),
  }))

  return (
    <RadioGroupFromOptions
      label={formatMessage({ id: 'No8PqR', defaultMessage: 'Punkt-Typ' })}
      name="marker_type"
      options={options}
      value={row.marker_type ?? ''}
      onChange={onChange}
    />
  )
}
