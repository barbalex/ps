import { useIntl } from 'react-intl'

import { RadioGroupFromOptions } from '../../components/shared/RadioGroupFromOptions.tsx'
import { vectorLayerFillRuleOptions } from '../../modules/constants.ts'

export const FillRule = ({ onChange, row }) => {
  const { formatMessage } = useIntl()

  const options = vectorLayerFillRuleOptions.map((o) => ({
    value: o.value,
    label: formatMessage({ id: o.labelId, defaultMessage: o.defaultMessage }),
  }))

  return (
    <RadioGroupFromOptions
      label={formatMessage({
        id: 'Mn7OpQ',
        defaultMessage:
          'Füllung: Regel, um den Inhalt von Flächen zu bestimmen',
      })}
      name="fill_rule"
      options={options}
      value={row.fill_rule ?? ''}
      onChange={onChange}
    />
  )
}
