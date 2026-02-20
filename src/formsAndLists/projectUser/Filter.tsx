import { Filter } from '../../components/shared/Filter/index.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'

const userRoles = ['manager', 'editor', 'reader']

type Props = {
  from: string
}

export const ProjectUserFilter = ({ from }: Props) => (
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
          list={userRoles}
          value={row.role ?? ''}
          onChange={onChange}
        />
      </>
    )}
  </Filter>
)
