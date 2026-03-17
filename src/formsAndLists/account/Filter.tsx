import { useIntl } from 'react-intl'
import { Filter } from '../../components/shared/Filter/index.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { DateField } from '../../components/shared/DateField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { accountTypeOptions } from '../../modules/constants.ts'

type Props = {
  from: string
}

export const AccountFilter = ({ from }: Props) => {
  const { formatMessage } = useIntl()
  return (
    <Filter from={from}>
      {({ row, onChange }) => (
        <>
          <DropdownField
            label={formatMessage({ id: 'qyI8KV', defaultMessage: 'Benutzer' })}
            name="user_id"
            table="users"
            value={row.user_id ?? ''}
            onChange={onChange}
          />
          <RadioGroupField
            label={formatMessage({ id: 'wA1BcD', defaultMessage: 'Typ' })}
            name="type"
            list={accountTypeOptions.map((o) => o.value)}
            labelMap={Object.fromEntries(
              accountTypeOptions.map((o) => [
                o.value,
                formatMessage({
                  id: o.labelId,
                  defaultMessage: o.defaultMessage,
                }),
              ]),
            )}
            value={row.type ?? ''}
            onChange={onChange}
          />
          <DateField
            label={formatMessage({ id: '88zF4u', defaultMessage: 'Beginnt' })}
            name="period_start"
            value={row.period_start}
            onChange={onChange}
          />
          <DateField
            label={formatMessage({ id: '20y992', defaultMessage: 'Endet' })}
            name="period_end"
            value={row.period_end}
            onChange={onChange}
          />
        </>
      )}
    </Filter>
  )
}
