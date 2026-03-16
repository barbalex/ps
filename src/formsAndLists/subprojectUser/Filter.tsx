import { Filter } from '../../components/shared/Filter/index.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { userRoleOptions } from '../../modules/constants.ts'

type Props = {
  from: string
}

export const SubprojectUserFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange }) => (
      <>
        <DropdownField
          label="User"
          name="user_id"
          table="users"
          value={row.user_id ?? ''}
          onChange={onChange}
        />
        <RadioGroupField
          label="Role"
          name="role"
          list={userRoleOptions.map((o) => o.value)}
          value={row.role ?? ''}
          onChange={onChange}
        />
      </>
    )}
  </Filter>
)
