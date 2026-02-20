import { Filter } from "../../components/shared/Filter/index.tsx";
import { PlaceReportForm } from "./Form.tsx";

type Props = {
  from: string;
  level?: number;
};

export const PlaceReportFilter = ({ from, level }: Props) => (
  <Filter from={from} level={level}>
    {({ row, onChange, orIndex }) => (
      <PlaceReportForm
        row={row}
        onChange={onChange}
        orIndex={orIndex}
        from={from}
      />
    )}
  </Filter>
);
