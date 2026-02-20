import { Filter } from '../../components/shared/Filter/index.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { TextArea } from '../../components/shared/TextArea.tsx'

type Props = {
  from: string
}

export const CrsFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange }) => (
      <>
        <TextField
          label="Code"
          name="code"
          value={row.code ?? ''}
          onChange={onChange}
        />
        <TextField
          label="Name"
          name="name"
          value={row.name ?? ''}
          onChange={onChange}
        />
        <TextArea
          label="Proj4 Value"
          name="proj4"
          value={row.proj4 ?? ''}
          onChange={onChange}
        />
      </>
    )}
  </Filter>
)