import { useIntl } from 'react-intl'
import { Filter } from '../../components/shared/Filter/index.tsx'
import { TextField } from '../../components/shared/TextField.tsx'

type Props = {
  from: string
}

export const ObservationImportFilter = ({ from }: Props) => {
  const { formatMessage } = useIntl()
  return (
    <Filter from={from}>
      {({ row, onChange }) => (
        <>
          <TextField
            label={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
            name="name"
            value={row.name ?? ''}
            onChange={onChange}
          />
          <TextField
            label={formatMessage({
              id: 'fII9jJ',
              defaultMessage: 'GBIF-Download-Schlüssel',
            })}
            name="gbif_download_key"
            value={row.gbif_download_key ?? ''}
            onChange={onChange}
          />
        </>
      )}
    </Filter>
  )
}
