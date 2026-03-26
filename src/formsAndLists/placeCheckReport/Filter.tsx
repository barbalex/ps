import { Filter } from "../../components/shared/Filter/index.tsx";
import { PlaceCheckReportForm } from "./Form.tsx";

type Props = {
  from: string;
  level?: number;
};

export const PlaceCheckReportFilter = ({ from, level }: Props) => (
  <Filter from={from} level={level}>
    {({ row, onChange, orIndex }) => (
      <PlaceCheckReportForm
        row={row}
        onChange={onChange}
        orIndex={orIndex}
        from={from}
      />
    )}
  </Filter>
);
