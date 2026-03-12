import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'
import { useIntl } from 'react-intl'

import { RadioGroupFromOptions } from '../../components/shared/RadioGroupFromOptions.tsx'

export const LineCap = ({ onChange, row }) => {
  const isFirstRender = useIsFirstRender()
  const { formatMessage } = useIntl()
  const res = useLiveQuery(
    `SELECT line_cap FROM vector_layer_line_caps order by sort, line_cap`,
  )
  const isLoading = isFirstRender && res === undefined
  const lineCapLabels: Record<string, string> = {
    butt: formatMessage({ id: 'Qr1StU', defaultMessage: 'Abrupt' }),
    round: formatMessage({ id: 'Rs2TuV', defaultMessage: 'Rund' }),
    square: formatMessage({ id: 'St3UvW', defaultMessage: 'Quadratisch' }),
  }
  const options = (res?.rows.map((r) => r.line_cap) ?? []).map((c) => ({
    value: c,
    label: lineCapLabels[c] ?? c,
  }))

  return (
    <RadioGroupFromOptions
      label={formatMessage({
        id: 'Ef9GhI',
        defaultMessage: 'Linien: Abschluss',
      })}
      name="line_cap"
      options={options}
      isLoading={isLoading}
      value={row.line_cap ?? ''}
      onChange={onChange}
    />
  )
}
