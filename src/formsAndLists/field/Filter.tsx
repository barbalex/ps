import { Filter } from "../../components/shared/Filter/index.tsx";
import { FieldForm } from "./Form.tsx";

type Props = {
  from: string;
};

export const FieldFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange }) => (
      <FieldForm
        row={row}
        onChange={(e, data) => onChange(e, data!)}
        from={from}
      />
    )}
  </Filter>
);
