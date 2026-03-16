import { Filter } from '../../components/shared/Filter/index.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { taxonomyTypeOptions } from '../../modules/constants.ts'

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
        <RadioGroupField
          label="Type"
          name="type"
          list={taxonomyTypeOptions.map((o) => o.value)}
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
