import { Filter } from "../../components/shared/Filter/index.tsx";
import { SubprojectReportForm } from "./Form.tsx";

type Props = {
  from: string;
};

export const SubprojectReportFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange, orIndex }) => (
      <SubprojectReportForm
        row={row}
        onChange={onChange}
        orIndex={orIndex}
        from={from}
      />
    )}
  </Filter>
);
