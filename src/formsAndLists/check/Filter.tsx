import { Filter } from "../../components/shared/Filter/index.tsx";
import { CheckForm } from "./Form.tsx";

type Props = {
  from: string;
  level?: number;
};

export const CheckFilter = ({ from, level }: Props) => (
  <Filter from={from} level={level}>
    {({ row, onChange, orIndex }) => (
      <CheckForm row={row} onChange={onChange} orIndex={orIndex} from={from} />
    )}
  </Filter>
);
