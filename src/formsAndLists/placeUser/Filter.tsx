import { useIntl } from 'react-intl'
import { Filter } from '../../components/shared/Filter/index.tsx';
import { DropdownField } from "../../components/shared/DropdownField.tsx";
import { RadioGroupField } from "../../components/shared/RadioGroupField.tsx";
import { userRoleOptions } from '../../modules/constants.ts'

type Props = {
  from: string;
  level?: number;
};

export const PlaceUserFilter = ({ from, level }: Props) => {
  const { formatMessage } = useIntl()
  return (
  <Filter from={from} level={level}>
    {({ row, onChange }) => (
      <>
        <DropdownField
          label={formatMessage({ id: 'qyI8KV', defaultMessage: 'Benutzer' })}
          name="project_user_id"
          table="project_users"
          value={row.project_user_id ?? ""}
          onChange={onChange}
        />
        <RadioGroupField
          label={formatMessage({ id: 'Gj0HkM', defaultMessage: 'Rolle' })}
          name="role"
          list={userRoleOptions.map((o) => o.value)}
          labelMap={Object.fromEntries(
            userRoleOptions.map((o) => [
              o.value,
              formatMessage({ id: o.labelId, defaultMessage: o.defaultMessage }),
            ]),
          )}
          value={row.role ?? ""}
          onChange={onChange}
        />
      </>
    )}
  </Filter>
  )
};
