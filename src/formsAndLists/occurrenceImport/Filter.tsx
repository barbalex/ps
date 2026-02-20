import { Filter } from '../../components/shared/Filter/index.tsx'
import { TextField } from '../../components/shared/TextField.tsx'

type Props = {
  from: string
}

export const OccurrenceImportFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange }) => (
      <>
        <TextField
          label="Name"
          name="name"
          value={row.name ?? ''}
          onChange={onChange}
        />
        <TextField
          label="GBIF Download Key"
          name="gbif_download_key"
          value={row.gbif_download_key ?? ''}
          onChange={onChange}
        />
      </>
    )}
  </Filter>
)
