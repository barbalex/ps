import { Filter } from "../../components/shared/Filter/index.tsx";
import { VectorLayerForm } from "./Form/index.tsx";

type Props = {
  from: string;
};

export const VectorLayerFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange }) => (
      <VectorLayerForm
        row={row}
        onChange={onChange}
        isFilter={true}
        from={from}
      />
    )}
  </Filter>
);
