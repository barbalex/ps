import { useIntl } from 'react-intl'

import { RadioGroupFromOptions } from '../../components/shared/RadioGroupFromOptions.tsx'
import { vectorLayerLineCapOptions } from '../../modules/constants.ts'
import type VectorLayerDisplays from '../../models/public/VectorLayerDisplays.ts'
import type { FieldChangeHandler } from '../../components/shared/fieldChange.ts'

export const LineCap = ({
  onChange,
  row,
}: {
  onChange: FieldChangeHandler
  row: VectorLayerDisplays | Record<string, never>
}) => {
  const { formatMessage } = useIntl()

  const options = vectorLayerLineCapOptions.map((o) => ({
    value: o.value,
    label: formatMessage({ id: o.labelId, defaultMessage: o.defaultMessage }),
  }))

  return (
    <RadioGroupFromOptions
      label={formatMessage({
        id: 'Ef9GhI',
        defaultMessage: 'Linien: Abschluss',
      })}
      name="line_cap"
      options={options}
      value={row.line_cap ?? ''}
      onChange={(ev) => onChange(ev as React.ChangeEvent<HTMLInputElement>)}
    />
  )
}
