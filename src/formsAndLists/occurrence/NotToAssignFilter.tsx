import { Filter } from '../../components/shared/Filter/index.tsx'
import { TextField } from '../../components/shared/TextField.tsx'

type Props = {
  from: string
}

export const OccurrenceNotToAssignFilter = ({ from }: Props) => (
  <Filter
    from={from}
    tableNameOverride="occurrences"
    filterAtomNameOverride="occurrencesNotToAssignFilterAtom"
  >
    {({ row, onChange }) => (
      <TextField
        label="Raw data contains"
        name="data"
        value={row.data ?? ''}
        onChange={onChange}
      />
    )}
  </Filter>
)
