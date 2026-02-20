import { Filter } from '../../components/shared/Filter/index.tsx'
import { TextField } from '../../components/shared/TextField.tsx'

const from = '/data/users/filter'

export const UserFilter = () => (
  <Filter from={from}>
    {({ row, onChange }) => (
      <TextField
        label="Email"
        name="email"
        type="email"
        value={row.email ?? ''}
        onChange={onChange}
      />
    )}
  </Filter>
)
