import { Filter } from "../../components/shared/Filter/index.tsx";
import { TextField } from "../../components/shared/TextField.tsx";

type Props = {
  from: string;
};

export const WmsServiceFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange }) => (
      <>
        <TextField
          label="URL"
          name="url"
          value={row.url ?? ""}
          onChange={onChange}
        />
        <TextField
          label="Version"
          name="version"
          value={row.version ?? ""}
          onChange={onChange}
        />
      </>
    )}
  </Filter>
);
