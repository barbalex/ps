import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'
import { useIntl } from 'react-intl'

import { RadioGroupFromOptions } from '../../components/shared/RadioGroupFromOptions.tsx'

export const LineJoin = ({ onChange, row }) => {
  const isFirstRender = useIsFirstRender()
  const { formatMessage } = useIntl()
  const res = useLiveQuery(
    `SELECT line_join FROM vector_layer_line_joins order by sort, line_join`,
  )
  const isLoading = isFirstRender && res === undefined
  const lineJoinLabels: Record<string, string> = {
    arcs: formatMessage({ id: 'Xy8ZaB', defaultMessage: 'Bogen' }),
    round: formatMessage({ id: 'Rs2TuV', defaultMessage: 'Rund' }),
    miter: formatMessage({ id: 'Tu4VwX', defaultMessage: 'Spitz' }),
    bevel: formatMessage({ id: 'Uv5WxY', defaultMessage: 'Schräg' }),
  }
  const options = (res?.rows.map((r) => r.line_join) ?? []).map((j) => ({
    value: j,
    label: lineJoinLabels[j] ?? j,
  }))

  return (
    <RadioGroupFromOptions
      label={formatMessage({ id: 'Fg0HiJ', defaultMessage: 'Linien: Ecken' })}
      name="line_join"
      options={options}
      isLoading={isLoading}
      value={row.line_join ?? ''}
      onChange={onChange}
    />
  )
}
