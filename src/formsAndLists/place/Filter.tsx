import { Filter } from "../../components/shared/Filter/index.tsx";
import { PlaceForm } from "./Form.tsx";

type Props = {
  from: string;
};

export const PlaceFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange, orIndex }) => (
      <PlaceForm row={row} onChange={onChange} orIndex={orIndex} from={from} />
    )}
  </Filter>
);
