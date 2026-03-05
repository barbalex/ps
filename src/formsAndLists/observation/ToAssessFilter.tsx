import { Filter } from '../../components/shared/Filter/index.tsx'
import { TextField } from '../../components/shared/TextField.tsx'

type Props = {
  from: string
}

export const ObservationToAssessFilter = ({ from }: Props) => (
  <Filter
    from={from}
    tableNameOverride="observations"
    filterAtomNameOverride="observationsToAssessFilterAtom"
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
