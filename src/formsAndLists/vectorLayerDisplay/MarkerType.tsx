import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'
import { useIntl } from 'react-intl'

import { RadioGroupFromOptions } from '../../components/shared/RadioGroupFromOptions.tsx'

export const MarkerType = ({ onChange, row }) => {
  const isFirstRender = useIsFirstRender()
  const { formatMessage } = useIntl()
  const res = useLiveQuery(
    `SELECT marker_type FROM vector_layer_marker_types order by sort, marker_type`,
  )
  const isLoading = isFirstRender && res === undefined
  const markerTypeLabels: Record<string, string> = {
    circle: formatMessage({ id: 'Op9QrS', defaultMessage: 'Kreis' }),
    marker: formatMessage({ id: 'Pq0RsT', defaultMessage: 'Marker' }),
  }
  const options = (res?.rows.map((r) => r.marker_type) ?? []).map((t) => ({
    value: t,
    label: markerTypeLabels[t] ?? t,
  }))

  return (
    <RadioGroupFromOptions
      label={formatMessage({ id: 'No8PqR', defaultMessage: 'Punkt-Typ' })}
      name="marker_type"
      options={options}
      isLoading={isLoading}
      value={row.marker_type ?? ''}
      onChange={onChange}
    />
  )
}
