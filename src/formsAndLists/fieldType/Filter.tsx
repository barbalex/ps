import { Filter } from "../../components/shared/Filter/index.tsx";
import { FieldTypeForm } from "./Form.tsx";

type Props = {
  from: string;
};

export const FieldTypeFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange }) => <FieldTypeForm row={row} onChange={onChange} />}
  </Filter>
);
