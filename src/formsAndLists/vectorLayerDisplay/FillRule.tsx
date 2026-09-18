import { useIntl } from 'react-intl'

import { RadioGroupFromOptions } from '../../components/shared/RadioGroupFromOptions.tsx'
import { vectorLayerFillRuleOptions } from '../../modules/constants.ts'
import type VectorLayerDisplays from '../../models/public/VectorLayerDisplays.ts'

export const FillRule = ({
  onChange,
  row,
}: {
  onChange: (e: React.ChangeEvent<any>, data?: any) => void
  row: VectorLayerDisplays | Record<string, any>
}) => {
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
      onChange={(ev) => onChange(ev as React.ChangeEvent<HTMLInputElement>)}
    />
  )
}
