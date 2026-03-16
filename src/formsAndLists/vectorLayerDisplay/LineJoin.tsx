import { useIntl } from 'react-intl'

import { RadioGroupFromOptions } from '../../components/shared/RadioGroupFromOptions.tsx'
import { vectorLayerLineJoinOptions } from '../../modules/constants.ts'

export const LineJoin = ({ onChange, row }) => {
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
      onChange={onChange}
    />
  )
}
