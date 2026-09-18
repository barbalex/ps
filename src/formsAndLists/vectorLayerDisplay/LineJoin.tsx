import { useIntl } from 'react-intl'

import { RadioGroupFromOptions } from '../../components/shared/RadioGroupFromOptions.tsx'
import { vectorLayerLineJoinOptions } from '../../modules/constants.ts'
import type VectorLayerDisplays from '../../models/public/VectorLayerDisplays.ts'

export const LineJoin = ({
  onChange,
  row,
}: {
  onChange: (e: React.ChangeEvent<any>, data?: any) => void
  row: VectorLayerDisplays | Record<string, any>
}) => {
  const { formatMessage } = useIntl()

  const options = vectorLayerLineJoinOptions.map((o) => ({
    value: o.value,
    label: formatMessage({ id: o.labelId, defaultMessage: o.defaultMessage }),
  }))

  return (
    <RadioGroupFromOptions
      label={formatMessage({ id: 'Fg0HiJ', defaultMessage: 'Linien: Ecken' })}
      name="line_join"
      options={options}
      value={row.line_join ?? ''}
      onChange={(ev) => onChange(ev as React.ChangeEvent<HTMLInputElement>)}
    />
  )
}
