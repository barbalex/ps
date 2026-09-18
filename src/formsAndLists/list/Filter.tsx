import { Filter } from "../../components/shared/Filter/index.tsx";
import { ListForm } from "./Form.tsx";
import type Lists from "../../models/public/Lists.ts";

type Props = {
  from: string;
};

export const ListFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange, orIndex }) => (
      <ListForm
        row={row as unknown as Lists}
        onChange={onChange}
        orIndex={orIndex}
      />
    )}
  </Filter>
);
