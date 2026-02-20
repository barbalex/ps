import { Filter } from "../../components/shared/Filter/index.tsx";
import { ListForm } from "./Form.tsx";

type Props = {
  from: string;
};

export const ListFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange, orIndex }) => (
      <ListForm row={row} onChange={onChange} orIndex={orIndex} />
    )}
  </Filter>
);
