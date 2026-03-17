import { useIntl } from 'react-intl'
import { Filter } from '../../components/shared/Filter/index.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { TextArea } from '../../components/shared/TextArea.tsx'

type Props = {
  from: string
}

export const CrsFilter = ({ from }: Props) => {
  const { formatMessage } = useIntl()
  return (
    <Filter from={from}>
      {({ row, onChange }) => (
        <>
          <TextField
            label={formatMessage({ id: 'Fz4gCh', defaultMessage: 'Code' })}
            name="code"
            value={row.code ?? ''}
            onChange={onChange}
          />
          <TextField
            label={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
            name="name"
            value={row.name ?? ''}
            onChange={onChange}
          />
          <TextArea
            label={formatMessage({
              id: 'Gv5hDi',
              defaultMessage: 'Proj4-Wert',
            })}
            name="proj4"
            value={row.proj4 ?? ''}
            onChange={onChange}
          />
        </>
      )}
    </Filter>
  )
}
