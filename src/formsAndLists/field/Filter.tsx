import { Filter } from "../../components/shared/Filter/index.tsx";
import { FieldForm } from "./Form.tsx";

type Props = {
  from: string;
};

export const FieldFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange }) => (
      <FieldForm row={row} onChange={onChange} from={from} />
    )}
  </Filter>
);
