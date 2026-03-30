import { Filter } from "../../components/shared/Filter/index.tsx";
import { CheckReportForm } from "./Form.tsx";

type Props = {
  from: string;
  level?: number;
};

export const CheckReportFilter = ({ from, level }: Props) => (
  <Filter from={from} level={level}>
    {({ row, onChange, orIndex }) => (
      <CheckReportForm
        row={row}
        onChange={onChange}
        orIndex={orIndex}
        from={from}
      />
    )}
  </Filter>
);
