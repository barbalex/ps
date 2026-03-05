import { Filter } from '../../components/shared/Filter/index.tsx'
import { TextField } from '../../components/shared/TextField.tsx'

type Props = {
  from: string
}

export const ObservationNotToAssignFilter = ({ from }: Props) => (
  <Filter
    from={from}
    tableNameOverride="observations"
    filterAtomNameOverride="observationsNotToAssignFilterAtom"
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
