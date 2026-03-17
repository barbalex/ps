import { useIntl } from 'react-intl'
import { Filter } from '../../components/shared/Filter/index.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { taxonomyTypeOptions } from '../../modules/constants.ts'

type Props = {
  from: string
}

export const TaxonomyFilter = ({ from }: Props) => {
  const { formatMessage } = useIntl()
  const labelMap = Object.fromEntries(
    taxonomyTypeOptions.map((o) => [
      o.value,
      formatMessage({ id: o.labelId, defaultMessage: o.defaultMessage }),
    ]),
  )
  return (
    <Filter from={from}>
      {({ row, onChange }) => (
        <>
          <TextField
            label={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
            name="name"
            value={row.name ?? ''}
            onChange={onChange}
          />
          <RadioGroupField
            label={formatMessage({ id: 'wA1BcD', defaultMessage: 'Typ' })}
            name="type"
            list={taxonomyTypeOptions.map((o) => o.value)}
            labelMap={labelMap}
            value={row.type ?? ''}
            onChange={onChange}
          />
          <TextField
            label={formatMessage({ id: 'TpzCEx', defaultMessage: 'URL' })}
            name="url"
            value={row.url ?? ''}
            onChange={onChange}
          />
        </>
      )}
    </Filter>
  )
}
