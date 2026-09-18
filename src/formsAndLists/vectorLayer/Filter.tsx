import { Filter } from "../../components/shared/Filter/index.tsx";
import { VectorLayerForm } from "./Form/index.tsx";
import type VectorLayers from "../../models/public/VectorLayers.ts";

type Props = {
  from: string;
};

export const VectorLayerFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange }) => (
      <VectorLayerForm
        row={row as unknown as VectorLayers}
        onChange={onChange}
        isFilter={true}
        from={from}
      />
    )}
  </Filter>
);
