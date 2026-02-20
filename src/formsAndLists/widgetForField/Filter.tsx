import { Filter } from "../../components/shared/Filter/index.tsx";
import { WidgetForFieldForm } from "./Form.tsx";

type Props = {
  from: string;
};

export const WidgetForFieldFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange }) => (
      <WidgetForFieldForm row={row} onChange={onChange} from={from} />
    )}
  </Filter>
);
