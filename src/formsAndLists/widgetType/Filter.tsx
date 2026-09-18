import { Filter } from "../../components/shared/Filter/index.tsx";
import { WidgetTypeForm } from "./Form.tsx";

type Props = {
  from: string;
};

export const WidgetTypeFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange }) => <WidgetTypeForm row={row} onChange={onChange} />}
  </Filter>
);
