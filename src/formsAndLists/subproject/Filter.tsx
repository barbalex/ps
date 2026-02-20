import { Filter } from "../../components/shared/Filter/index.tsx";
import { SubprojectForm } from "./Form.tsx";

type Props = {
  from: string;
};

export const SubprojectFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange, orIndex }) => (
      <SubprojectForm
        row={row}
        onChange={onChange}
        orIndex={orIndex}
        from={from}
      />
    )}
  </Filter>
);
