import { useIntl } from 'react-intl'
import { Filter } from '../../components/shared/Filter/index.tsx'
import { TextField } from '../../components/shared/TextField.tsx'

type Props = {
  from: string
}

export const ProjectQcFilter = ({ from }: Props) => {
  const { formatMessage } = useIntl()
  return (
    <Filter
      from={from}
      tableNameOverride="project_qcs"
    >
      {({ row, onChange }) => (
        <>
          <TextField
            label={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
            name="name_de"
            value={row.name_de ?? ''}
            onChange={onChange}
          />
        </>
      )}
    </Filter>
  )
}
