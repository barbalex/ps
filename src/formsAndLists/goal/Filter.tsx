import { Filter } from "../../components/shared/Filter/index.tsx";
import { GoalForm } from "./Form.tsx";

type Props = {
  from: string;
};

export const GoalFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange, orIndex }) => (
      <GoalForm row={row} onChange={onChange} orIndex={orIndex} from={from} />
    )}
  </Filter>
);
