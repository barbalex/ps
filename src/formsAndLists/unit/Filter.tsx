import { Filter } from "../../components/shared/Filter/index.tsx";
import { UnitForm } from "./Form.tsx";

type Props = {
  from: string;
};

export const UnitFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange }) => <UnitForm row={row} onChange={onChange} />}
  </Filter>
);
