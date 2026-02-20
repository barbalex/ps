import { Filter } from '../../components/shared/Filter/index.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'

type Props = {
  from: string
}

export const TaxonomyFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange }) => (
      <>
        <TextField
          label="Name"
          name="name"
          value={row.name ?? ''}
          onChange={onChange}
        />
        <DropdownField
          label="Type"
          name="type"
          table="taxonomy_types"
          labelField="type"
          orderBy="sort, type"
          value={row.type ?? ''}
          onChange={onChange}
        />
        <TextField
          label="Url"
          name="url"
          value={row.url ?? ''}
          onChange={onChange}
        />
      </>
    )}
  </Filter>
)
