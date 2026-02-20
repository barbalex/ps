import { Filter } from "../../components/shared/Filter/index.tsx";
import { TextField } from "../../components/shared/TextField.tsx";

type Props = {
  from: string;
};

export const FileFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange }) => (
      <TextField
        label="Label"
        name="label"
        value={row.label ?? ""}
        onChange={onChange}
      />
    )}
  </Filter>
);
