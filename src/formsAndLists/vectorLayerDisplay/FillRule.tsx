import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'
import { useIntl } from 'react-intl'

import { RadioGroupFromOptions } from '../../components/shared/RadioGroupFromOptions.tsx'

export const FillRule = ({ onChange, row }) => {
  const isFirstRender = useIsFirstRender()
  const { formatMessage } = useIntl()
  const res = useLiveQuery(
    `SELECT fill_rule FROM vector_layer_fill_rules order by sort, fill_rule`,
  )
  const isLoading = isFirstRender && res === undefined
  const fillRuleLabels: Record<string, string> = {
    evenodd: formatMessage({ id: 'Vw6XyZ', defaultMessage: 'Gerade-Ungerade' }),
    nonzero: formatMessage({ id: 'Wx7YzA', defaultMessage: 'Nicht-Null' }),
  }
  const options = (res?.rows.map((r) => r.fill_rule) ?? []).map((r) => ({
    value: r,
    label: fillRuleLabels[r] ?? r,
  }))

  return (
    <RadioGroupFromOptions
      label={formatMessage({ id: 'Mn7OpQ', defaultMessage: 'Füllung: Regel, um den Inhalt von Flächen zu bestimmen' })}
      name="fill_rule"
      options={options}
      isLoading={isLoading}
      value={row.fill_rule ?? ''}
      onChange={onChange}
    />
  )
}
