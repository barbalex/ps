import { Filter } from "../../components/shared/Filter/index.tsx";
import { CheckForm } from "./Form.tsx";
import type Checks from "../../models/public/Checks.ts";

type Props = {
  from: string;
  level?: number;
};

export const CheckFilter = ({ from, level }: Props) => (
  <Filter from={from} level={level}>
    {({ row, onChange, orIndex }) => (
      <CheckForm
        row={row as unknown as Checks}
        onChange={onChange}
        orIndex={orIndex}
        from={from}
      />
    )}
  </Filter>
);
