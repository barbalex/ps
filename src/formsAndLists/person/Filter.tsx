import { Filter } from "../../components/shared/Filter/index.tsx";
import { PersonForm } from "./Form.tsx";

type Props = {
  from: string;
};

export const PersonFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange, orIndex }) => (
      <PersonForm row={row} onChange={onChange} orIndex={orIndex} from={from} />
    )}
  </Filter>
);
