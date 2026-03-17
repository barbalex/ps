import { useIntl } from 'react-intl'
import { Filter } from "../../components/shared/Filter/index.tsx";
import { TextField } from "../../components/shared/TextField.tsx";

type Props = {
  from: string;
};

export const UserFilter = ({ from }: Props) => {
  const { formatMessage } = useIntl()
  return (
    <Filter from={from}>
      {({ row, onChange }) => (
        <TextField
          label={formatMessage({ id: 'fHH8iI', defaultMessage: 'E-Mail' })}
          name="email"
          type="email"
          value={row.email ?? ""}
          onChange={onChange}
        />
      )}
    </Filter>
  )
}
