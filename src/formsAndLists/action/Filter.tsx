import { Filter } from "../../components/shared/Filter/index.tsx";
import { ActionForm } from "./Form.tsx";

type Props = {
  from: string;
  level?: number;
};

export const ActionFilter = ({ from, level }: Props) => (
  <Filter from={from} level={level}>
    {({ row, onChange, orIndex }) => (
      <ActionForm row={row} onChange={onChange} orIndex={orIndex} from={from} />
    )}
  </Filter>
);
