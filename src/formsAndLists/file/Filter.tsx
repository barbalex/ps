import { useIntl } from 'react-intl'

import { Filter } from '../../components/shared/Filter/index.tsx'
import { TextField } from '../../components/shared/TextField.tsx'

type Props = {
  from: string
}

export const FileFilter = ({ from }: Props) => {
  const { formatMessage } = useIntl()
  return (
    <Filter from={from}>
      {({ row, onChange }) => (
        <TextField
          label={formatMessage({ id: 'Fl3jPw', defaultMessage: 'Bezeichnung' })}
          name="label"
          value={row.label ?? ''}
          onChange={onChange}
        />
      )}
    </Filter>
  )
}
