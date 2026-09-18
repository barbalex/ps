import { useIntl } from 'react-intl'
import { Filter } from '../../components/shared/Filter/index.tsx'
import { TextField } from '../../components/shared/TextField.tsx'

type Props = {
  from: string
}
type OnChange = React.ComponentProps<typeof TextField>['onChange']

export const ObservationImportFilter = ({ from }: Props) => {
  const { formatMessage } = useIntl()
  return (
    <Filter from={from}>
      {({ row, onChange }) => (
        <>
          <TextField
            label={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
            name="name"
            value={(row.name as string | null | undefined) ?? ''}
            onChange={onChange as OnChange}
          />
          <TextField
            label={formatMessage({
              id: 'fII9jJ',
              defaultMessage: 'GBIF-Download-Schlüssel',
            })}
            name="gbif_download_key"
            value={(row.gbif_download_key as string | null | undefined) ?? ''}
            onChange={onChange as OnChange}
          />
        </>
      )}
    </Filter>
  )
}
