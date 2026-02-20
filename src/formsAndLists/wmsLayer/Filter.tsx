import { Filter } from "../../components/shared/Filter/index.tsx";
import { WmsLayerForm } from "./Form/index.tsx";

type Props = {
  from: string;
};

export const WmsLayerFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange }) => (
      <WmsLayerForm row={row} onChange={onChange} isFilter={true} />
    )}
  </Filter>
);
