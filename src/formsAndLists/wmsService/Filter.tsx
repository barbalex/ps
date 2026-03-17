import { useIntl } from 'react-intl'
import { Filter } from "../../components/shared/Filter/index.tsx";
import { TextField } from "../../components/shared/TextField.tsx";

type Props = {
  from: string;
};

export const WmsServiceFilter = ({ from }: Props) => {
  const { formatMessage } = useIntl()
  return (
    <Filter from={from}>
      {({ row, onChange }) => (
        <>
          <TextField
            label={formatMessage({ id: 'Yb8ZcE', defaultMessage: 'URL' })}
            name="url"
            value={row.url ?? ""}
            onChange={onChange}
          />
          <TextField
            label={formatMessage({ id: 'Yz9AbC', defaultMessage: 'Version' })}
            name="version"
            value={row.version ?? ""}
            onChange={onChange}
          />
        </>
      )}
    </Filter>
  )
}
